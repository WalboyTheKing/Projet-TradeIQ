// ============================================================================
// TRADEIQ — SWEEP & SETTLEMENT SERVICE (DEPOSIT ADDRESS → MERCHANT WALLET)
// ============================================================================
// Responsible for sweeping confirmed USDT funds from dedicated deposit addresses
// to the TRADEIQ merchant main wallet.
//
// CRITICAL ARCHITECTURAL REALITY (BNB GAS):
// - In BNB Smart Chain (BEP-20), an ERC-20 transfer initiated by a deposit address
//   requires BNB in THAT deposit address to pay for transaction gas (~60,000 gas, ~0.0002 BNB).
// - This service verifies the gas balance before attempting transfer.
// - If gas is missing, it marks status as 'awaiting_gas' and calculates needed gas.
// - If a gas dispatcher key is configured (GAS_DISPATCHER_PRIVATE_KEY), it can sponsor
//   the micro-gas transfer automatically.
// - Strict idempotency: Never sweeps twice.
// ============================================================================

import { ethers } from 'ethers';
import { bscWatcher, BSC_USDT_CONTRACT, BEP20_ABI } from './bscWatcher';
import { hdWalletService } from './hdWallet';
import { CryptoPaymentSession, SweepStatus } from './types';

export interface SweepResult {
  success: boolean;
  sweepStatus: SweepStatus;
  sweepTxHash?: string | null;
  amountUsdt?: number;
  error?: string;
  depositAddress: string;
  merchantAddress: string;
  gasBnbAvailable?: number;
  gasBnbNeeded?: number;
}

export class SweepService {
  private merchantMainAddress: string;
  private gasDispatcherKey: string | null;

  constructor() {
    this.merchantMainAddress =
      process.env.CRYPTO_MERCHANT_BSC_ADDRESS ||
      process.env.CRYPTO_USDT_ADDRESS ||
      process.env.USDT_BSC_DEPOSIT_ADDRESS ||
      '0x778F7c29fb8dc97916C352163413528361e75F4f';

    this.gasDispatcherKey = process.env.GAS_DISPATCHER_PRIVATE_KEY || null;
  }

  public getMerchantAddress(): string {
    return this.merchantMainAddress;
  }

  /**
   * Executes or evaluates sweeping for a confirmed payment session
   */
  public async sweepPayment(session: CryptoPaymentSession): Promise<SweepResult> {
    const depositAddress = session.depositAddress || session.paymentAddress;
    const merchantAddress = this.merchantMainAddress;

    // 1. Check if sweep is already completed or not required (idempotency)
    if (session.sweepStatus === 'confirmed') {
      return {
        success: true,
        sweepStatus: 'confirmed',
        sweepTxHash: session.sweepTxHash,
        amountUsdt: session.sweepAmountUsdt || session.amountUsdt,
        depositAddress,
        merchantAddress,
      };
    }

    if (session.sweepStatus === 'not_required') {
      return {
        success: true,
        sweepStatus: 'not_required',
        depositAddress,
        merchantAddress,
      };
    }

    // 2. Only confirmed payments are eligible for sweep
    if (session.status !== 'completed') {
      return {
        success: false,
        sweepStatus: 'pending',
        error: `Cannot sweep payment in '${session.status}' status (must be 'completed')`,
        depositAddress,
        merchantAddress,
      };
    }

    // 3. Check on-chain USDT balance of deposit address
    const usdtBalance = await bscWatcher.getUsdtBalance(depositAddress);
    if (usdtBalance <= 0) {
      // In sandbox mode or if already emptied
      return {
        success: true,
        sweepStatus: 'not_required',
        amountUsdt: 0,
        depositAddress,
        merchantAddress,
      };
    }

    // 4. Check on-chain BNB gas balance on the deposit address
    const bnbBalance = await bscWatcher.getBnbBalance(depositAddress);
    const estimatedGasBnb = 0.0003; // ~60,000 gas * 3-5 gwei on BSC ≈ 0.00018-0.0003 BNB

    if (bnbBalance < estimatedGasBnb) {
      // Attempt gas sponsorship if gas dispatcher is configured
      if (this.gasDispatcherKey) {
        try {
          const provider = bscWatcher.getProvider();
          const gasWallet = new ethers.Wallet(this.gasDispatcherKey, provider);
          console.log(`⛽ [TRADEIQ Sweep] Sponsoring ${estimatedGasBnb} BNB gas to deposit address ${depositAddress}...`);
          const gasTx = await gasWallet.sendTransaction({
            to: depositAddress,
            value: ethers.parseEther(estimatedGasBnb.toString()),
          });
          await gasTx.wait(1);
          console.log(`⛽ [TRADEIQ Sweep] Gas dispatched in tx ${gasTx.hash}`);
        } catch (gasErr: any) {
          console.warn(`⚠️ [TRADEIQ Sweep] Failed to dispatch gas:`, gasErr.message);
          return {
            success: false,
            sweepStatus: 'awaiting_gas',
            amountUsdt: usdtBalance,
            depositAddress,
            merchantAddress,
            gasBnbAvailable: bnbBalance,
            gasBnbNeeded: estimatedGasBnb,
            error: `Deposit address has ${usdtBalance} USDT but requires ${estimatedGasBnb} BNB for gas (available: ${bnbBalance} BNB)`,
          };
        }
      } else {
        return {
          success: false,
          sweepStatus: 'awaiting_gas',
          amountUsdt: usdtBalance,
          depositAddress,
          merchantAddress,
          gasBnbAvailable: bnbBalance,
          gasBnbNeeded: estimatedGasBnb,
          error: `Deposit address holds ${usdtBalance} USDT. Awaiting ${estimatedGasBnb} BNB gas to execute transfer to merchant wallet.`,
        };
      }
    }

    // 5. If derivation index is available and server has signing key:
    const derivationIndex = session.derivationIndex;
    if (typeof derivationIndex !== 'number') {
      return {
        success: false,
        sweepStatus: 'failed',
        error: 'Missing derivation index for deposit address',
        depositAddress,
        merchantAddress,
      };
    }

    const provider = bscWatcher.getProvider();
    const depositSigner = hdWalletService.getSignerForIndex(derivationIndex, provider);

    if (!depositSigner) {
      // Watch-only mode: Server cannot sign directly, requires external sweep execution
      return {
        success: false,
        sweepStatus: 'pending',
        error: 'Server is running in Watch-Only HD mode (no private keys). Sweep must be executed from offline master wallet.',
        depositAddress,
        merchantAddress,
        amountUsdt: usdtBalance,
      };
    }

    // 6. Execute BEP-20 USDT transfer to merchant wallet
    try {
      const usdtContractWithSigner = new ethers.Contract(BSC_USDT_CONTRACT, BEP20_ABI, depositSigner);
      const rawAmount = ethers.parseUnits(usdtBalance.toString(), 18);

      console.log(`🔄 [TRADEIQ Sweep] Sweeping ${usdtBalance} USDT from ${depositAddress} to ${merchantAddress}...`);
      const tx = await usdtContractWithSigner.transfer(merchantAddress, rawAmount);
      console.log(`🚀 [TRADEIQ Sweep] Broadcasted sweep tx: ${tx.hash}`);

      const receipt = await tx.wait(1);

      if (receipt && receipt.status === 1) {
        return {
          success: true,
          sweepStatus: 'confirmed',
          sweepTxHash: tx.hash,
          amountUsdt: usdtBalance,
          depositAddress,
          merchantAddress,
        };
      } else {
        return {
          success: false,
          sweepStatus: 'failed',
          sweepTxHash: tx.hash,
          error: 'Sweep transaction reverted on-chain',
          depositAddress,
          merchantAddress,
        };
      }
    } catch (txErr: any) {
      console.error('[TRADEIQ Sweep] Exception executing sweep:', txErr.message);
      return {
        success: false,
        sweepStatus: 'failed',
        error: `Transfer execution failed: ${txErr.message}`,
        depositAddress,
        merchantAddress,
      };
    }
  }
}

export const sweepService = new SweepService();
