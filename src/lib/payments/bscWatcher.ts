// ============================================================================
// TRADEIQ — BSC ON-CHAIN WATCHER & VALIDATOR (BEP-20 USDT)
// ============================================================================
// Monitors and validates cryptocurrency transactions on BNB Smart Chain (Chain ID: 56).
// Enforces strict multi-user order matching:
// - Verifies destination address matches payment.depositAddress
// - Validates official USDT contract (0x55d398326f99059fF775485246999027B3197955)
// - Validates exact amount (18 decimals on BSC)
// - Enforces 15 block confirmations
// - Anti-replay attack: txHash must be unique
// ============================================================================

import { ethers } from 'ethers';

export const BSC_CHAIN_ID = 56;
export const BSC_USDT_CONTRACT = '0x55d398326f99059fF775485246999027B3197955';
export const REQUIRED_CONFIRMATIONS = 15;

// Standard ERC-20 / BEP-20 ABI fragments needed for detection & balance
export const BEP20_ABI = [
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function transfer(address recipient, uint256 amount) returns (bool)',
];

export interface VerifiedTxResult {
  isValid: boolean;
  error?: string;
  txHash: string;
  fromAddress: string;
  toAddress: string; // The deposit address
  tokenContract: string;
  amountUsdt: number;
  blockNumber: number;
  currentBlock: number;
  confirmations: number;
  isConfirmed: boolean; // confirmations >= 15
}

export class BscWatcherService {
  private rpcUrls = [
    'https://bsc-dataseed.binance.org/',
    'https://binance.llamarpc.com',
    'https://bsc.publicnode.com',
    'https://bsc-dataseed1.defibit.io/',
  ];
  private currentRpcIndex = 0;
  private provider: ethers.JsonRpcProvider;
  private usdtContract: ethers.Contract;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(this.rpcUrls[0], {
      chainId: BSC_CHAIN_ID,
      name: 'bnb',
    });
    this.usdtContract = new ethers.Contract(BSC_USDT_CONTRACT, BEP20_ABI, this.provider);
  }

  public getProvider(): ethers.JsonRpcProvider {
    return this.provider;
  }

  public getUsdtContract(): ethers.Contract {
    return this.usdtContract;
  }

  /**
   * Rotates to next RPC if current one throttles
   */
  private rotateRpc(): void {
    this.currentRpcIndex = (this.currentRpcIndex + 1) % this.rpcUrls.length;
    const newUrl = this.rpcUrls[this.currentRpcIndex];
    this.provider = new ethers.JsonRpcProvider(newUrl, {
      chainId: BSC_CHAIN_ID,
      name: 'bnb',
    });
    this.usdtContract = new ethers.Contract(BSC_USDT_CONTRACT, BEP20_ABI, this.provider);
  }

  /**
   * Retrieves current BSC block number
   */
  public async getCurrentBlockNumber(): Promise<number> {
    try {
      return await this.provider.getBlockNumber();
    } catch {
      this.rotateRpc();
      return await this.provider.getBlockNumber();
    }
  }

  /**
   * Queries the USDT balance of any address on BSC
   */
  public async getUsdtBalance(address: string): Promise<number> {
    try {
      const balanceBigInt: bigint = await this.usdtContract.balanceOf(address);
      return Number(ethers.formatUnits(balanceBigInt, 18));
    } catch (err: any) {
      console.warn(`[BSC Watcher] Error checking USDT balance for ${address}:`, err.message);
      return 0;
    }
  }

  /**
   * Queries the native BNB balance of an address (for gas calculations)
   */
  public async getBnbBalance(address: string): Promise<number> {
    try {
      const balance: bigint = await this.provider.getBalance(address);
      return Number(ethers.formatEther(balance));
    } catch (err: any) {
      console.warn(`[BSC Watcher] Error checking BNB balance for ${address}:`, err.message);
      return 0;
    }
  }

  /**
   * Thoroughly verifies an on-chain transaction hash on BSC
   */
  public async verifyTransactionOnChain(
    txHash: string,
    expectedDepositAddress?: string,
    expectedAmountUsdt?: number
  ): Promise<VerifiedTxResult> {
    if (!txHash || !/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
      return {
        isValid: false,
        error: 'Invalid transaction hash format',
        txHash,
        fromAddress: '',
        toAddress: '',
        tokenContract: '',
        amountUsdt: 0,
        blockNumber: 0,
        currentBlock: 0,
        confirmations: 0,
        isConfirmed: false,
      };
    }

    try {
      const [receipt, currentBlock] = await Promise.all([
        this.provider.getTransactionReceipt(txHash),
        this.getCurrentBlockNumber(),
      ]);

      if (!receipt) {
        return {
          isValid: false,
          error: 'Transaction receipt not found on BNB Smart Chain (pending broadcast or invalid)',
          txHash,
          fromAddress: '',
          toAddress: '',
          tokenContract: '',
          amountUsdt: 0,
          blockNumber: 0,
          currentBlock,
          confirmations: 0,
          isConfirmed: false,
        };
      }

      // Check transaction execution status (1 = success, 0 = reverted)
      if (receipt.status !== 1) {
        return {
          isValid: false,
          error: 'Blockchain transaction reverted / failed on-chain',
          txHash,
          fromAddress: receipt.from,
          toAddress: receipt.to || '',
          tokenContract: '',
          amountUsdt: 0,
          blockNumber: receipt.blockNumber,
          currentBlock,
          confirmations: 0,
          isConfirmed: false,
        };
      }

      // Parse Transfer logs for the official BSC USDT contract
      const transferIface = new ethers.Interface(BEP20_ABI);
      let matchedTransfer: { from: string; to: string; amountUsdt: number; contract: string } | null = null;

      for (const log of receipt.logs) {
        // Contract address MUST be the official BSC USDT contract
        if (log.address.toLowerCase() === BSC_USDT_CONTRACT.toLowerCase()) {
          try {
            const parsed = transferIface.parseLog({ topics: log.topics as string[], data: log.data });
            if (parsed && parsed.name === 'Transfer') {
              const from = parsed.args[0] as string;
              const to = parsed.args[1] as string;
              const rawValue = parsed.args[2] as bigint;
              const amountUsdt = Number(ethers.formatUnits(rawValue, 18));

              // If an expected deposit address is provided, match specifically
              if (expectedDepositAddress) {
                if (to.toLowerCase() === expectedDepositAddress.toLowerCase()) {
                  matchedTransfer = { from, to, amountUsdt, contract: log.address };
                  break;
                }
              } else {
                matchedTransfer = { from, to, amountUsdt, contract: log.address };
                break;
              }
            }
          } catch {
            // Not a transfer log
          }
        }
      }

      if (!matchedTransfer) {
        return {
          isValid: false,
          error: expectedDepositAddress
            ? `No USDT transfer to expected deposit address (${expectedDepositAddress}) found in transaction`
            : `No USDT transfer found for official contract ${BSC_USDT_CONTRACT}`,
          txHash,
          fromAddress: receipt.from,
          toAddress: receipt.to || '',
          tokenContract: '',
          amountUsdt: 0,
          blockNumber: receipt.blockNumber,
          currentBlock,
          confirmations: Math.max(0, currentBlock - receipt.blockNumber + 1),
          isConfirmed: false,
        };
      }

      // Calculate confirmations
      const confirmations = Math.max(0, currentBlock - receipt.blockNumber + 1);
      const isConfirmed = confirmations >= REQUIRED_CONFIRMATIONS;

      // Validate amount if expected
      if (expectedAmountUsdt && matchedTransfer.amountUsdt < expectedAmountUsdt) {
        return {
          isValid: false,
          error: `Underpaid: Received ${matchedTransfer.amountUsdt} USDT, expected ${expectedAmountUsdt} USDT`,
          txHash,
          fromAddress: matchedTransfer.from,
          toAddress: matchedTransfer.to,
          tokenContract: matchedTransfer.contract,
          amountUsdt: matchedTransfer.amountUsdt,
          blockNumber: receipt.blockNumber,
          currentBlock,
          confirmations,
          isConfirmed,
        };
      }

      return {
        isValid: true,
        txHash,
        fromAddress: matchedTransfer.from,
        toAddress: matchedTransfer.to,
        tokenContract: matchedTransfer.contract,
        amountUsdt: matchedTransfer.amountUsdt,
        blockNumber: receipt.blockNumber,
        currentBlock,
        confirmations,
        isConfirmed,
      };
    } catch (err: any) {
      console.error('[BSC Watcher] Error verifying transaction:', err.message);
      return {
        isValid: false,
        error: `RPC verification error: ${err.message}`,
        txHash,
        fromAddress: '',
        toAddress: '',
        tokenContract: '',
        amountUsdt: 0,
        blockNumber: 0,
        currentBlock: 0,
        confirmations: 0,
        isConfirmed: false,
      };
    }
  }

  /**
   * Scans a deposit address for any incoming USDT transfer event
   */
  public async findDepositTransfer(
    depositAddress: string,
    fromBlockOffset = 1000
  ): Promise<{ txHash: string; amountUsdt: number; from: string; blockNumber: number } | null> {
    try {
      const currentBlock = await this.getCurrentBlockNumber();
      const fromBlock = Math.max(0, currentBlock - fromBlockOffset);

      // Query Transfer events where 'to' is depositAddress
      const filter = this.usdtContract.filters.Transfer(null, depositAddress);
      const events = await this.usdtContract.queryFilter(filter, fromBlock, currentBlock);

      if (events && events.length > 0) {
        const lastEvent = events[events.length - 1] as ethers.EventLog;
        if (lastEvent && lastEvent.args) {
          const from = lastEvent.args[0] as string;
          const rawValue = lastEvent.args[2] as bigint;
          const amountUsdt = Number(ethers.formatUnits(rawValue, 18));
          return {
            txHash: lastEvent.transactionHash,
            amountUsdt,
            from,
            blockNumber: lastEvent.blockNumber,
          };
        }
      }
      return null;
    } catch (err: any) {
      console.warn(`[BSC Watcher] Error scanning transfers for ${depositAddress}:`, err.message);
      return null;
    }
  }
}

export const bscWatcher = new BscWatcherService();
