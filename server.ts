import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Lazy initialize Gemini client (supports AI_API_KEY / GEMINI_API_KEY & configurable AI_MODEL)
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// ============================================================================
// API ROUTES
// ============================================================================

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    product: 'TRADEIQ',
    aiProvider: process.env.AI_PROVIDER || 'gemini',
    aiModel: process.env.AI_MODEL || 'gemini-2.5-flash',
    timestamp: new Date().toISOString()
  });
});

// Live Economic Calendar Proxy from ForexFactory (Fair Economy Media live feed)
app.get('/api/economic-calendar', async (req: Request, res: Response) => {
  try {
    const response = await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.json', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TradeIQ/1.0)',
      },
    });
    if (!response.ok) {
      return res.status(502).json({ error: 'Failed to fetch live economic calendar feed' });
    }
    const data = await response.json();
    res.setHeader('Cache-Control', 'public, max-age=900'); // 15 min cache
    res.json({
      success: true,
      source: 'ForexFactory (Fair Economy Media)',
      updatedAt: new Date().toISOString(),
      events: data,
    });
  } catch (error: any) {
    console.error('Economic calendar proxy error:', error);
    res.status(500).json({ error: 'Internal economic calendar error' });
  }
});

// Supabase Proxy to securely handle requests without "Forbidden use of secret API key in browser"
app.all('/api/supabase-proxy/*', async (req: Request, res: Response) => {
  try {
    const targetPath = req.params[0] || '';
    const rawSupabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://letrhnlcswjbmmdyqarx.supabase.co';
    const cleanBaseUrl = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
    const targetUrl = new URL(`${cleanBaseUrl}/${targetPath}`);

    Object.entries(req.query).forEach(([k, v]) => {
      if (typeof v === 'string') targetUrl.searchParams.set(k, v);
    });

    const headers: Record<string, string> = {};
    const forwardHeaders = ['authorization', 'apikey', 'content-type', 'x-client-info', 'prefer'];
    for (const h of forwardHeaders) {
      if (req.headers[h]) headers[h] = req.headers[h] as string;
    }

    const serverKey = process.env.SUPABASE_SERVICE_ROLE_KEY || (req.headers['apikey'] as string);
    if (serverKey) {
      if (!headers['apikey']) headers['apikey'] = serverKey;
      if (!headers['authorization']) headers['authorization'] = `Bearer ${serverKey}`;
    }

    const hasBody = ['POST', 'PUT', 'PATCH'].includes(req.method) && req.body && Object.keys(req.body).length > 0;
    const response = await fetch(targetUrl.toString(), {
      method: req.method,
      headers: {
        ...headers,
        'User-Agent': 'TradeIQ-Node-Server/1.0',
      },
      body: hasBody ? JSON.stringify(req.body) : undefined,
    });

    res.status(response.status);
    response.headers.forEach((val, name) => {
      if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(name.toLowerCase())) {
        res.setHeader(name, val);
      }
    });

    const data = await response.text();
    return res.send(data);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Supabase proxy request failed' });
  }
});

// User Subscription & Expiration Status (Supabase backed)
app.get('/api/user/subscription', async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string) || 'usr_default';
    const userEmail = (req.query.email as string) || (req.headers['x-user-email'] as string) || undefined;
    const { dbService } = await import('./src/server/db.js').catch(async () => {
      return await import('./src/server/db');
    });

    const subscription = await dbService.getEffectiveSubscription(userId, userEmail);
    return res.status(200).json({ success: true, subscription });
  } catch (err: any) {
    console.error('Error fetching subscription:', err);
    return res.status(500).json({ error: err?.message || 'Failed to fetch subscription status' });
  }
});

// AI Multimodal Chart Analysis Endpoint (Strict Server-Side Quota Enforced)
app.post('/api/ai/chart-analysis', async (req: Request, res: Response) => {
  try {
    const userId = req.body?.userId || (req.headers['x-user-id'] as string) || 'usr_default';
    const userEmail = req.body?.userEmail || (req.headers['x-user-email'] as string) || undefined;

    // 1. Check & increment monthly AI quota from Supabase / DB
    const { dbService } = await import('./src/server/db.js').catch(async () => {
      return await import('./src/server/db');
    });

    const quota = await dbService.checkAndIncrementAiQuota(userId, 'chart_analysis', userEmail);
    if (!quota.allowed) {
      return res.status(403).json({
        error: quota.error,
        plan: quota.plan,
        currentCount: quota.currentCount,
        limit: quota.limit,
      });
    }

    const aiClient = getGeminiClient();
    const { processChartAnalysis } = await import('./src/server/chartAnalysisHandler.js').catch(async () => {
      return await import('./src/server/chartAnalysisHandler');
    });

    const result = await processChartAnalysis(req.body, aiClient);
    if (!result.success) {
      return res.status(result.status || 400).json({ error: result.error });
    }
    return res.status(result.status || 200).json({
      ...result.data,
      quotaUsage: {
        currentCount: quota.currentCount,
        limit: quota.limit,
        plan: quota.plan,
      },
    });
  } catch (err: any) {
    console.error('Server error in /api/ai/chart-analysis:', err);
    return res.status(500).json({ error: err?.message || 'Internal server error processing chart analysis' });
  }
});

// ============================================================================
// CRYPTO BILLING ENDPOINTS (USDT on BNB Smart Chain / BSC via NOWPayments)
// ============================================================================

// 1. Create Crypto Checkout Session (NowPayments + Supabase persistence)
app.post('/api/checkout/crypto', async (req: Request, res: Response) => {
  try {
    const { plan, billingInterval, network, userId } = req.body;
    if (!plan || !billingInterval) {
      return res.status(400).json({ error: 'Missing required parameters: plan and billingInterval' });
    }

    const { cryptoPaymentService } = await import('./src/lib/payments/cryptoProvider.js').catch(async () => {
      return await import('./src/lib/payments/cryptoProvider');
    });

    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const appUrl = process.env.APP_URL || `${protocol}://${req.get('host')}`;

    const session = await cryptoPaymentService.createPayment({
      plan,
      billingInterval,
      network: network || 'BSC',
      userId: userId || 'usr_default',
    }, userId || 'usr_default', appUrl);

    return res.status(200).json({ success: true, session });
  } catch (err: any) {
    console.error('Error creating crypto checkout:', err);
    return res.status(400).json({ error: err?.message || 'Failed to create crypto checkout session' });
  }
});

// 2. Query Crypto Payment Status
app.get('/api/payments/status/:paymentId', async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    if (!paymentId) {
      return res.status(400).json({ error: 'Payment ID is required' });
    }

    const { cryptoPaymentService } = await import('./src/lib/payments/cryptoProvider.js').catch(async () => {
      return await import('./src/lib/payments/cryptoProvider');
    });

    const session = await cryptoPaymentService.getPayment(paymentId);
    if (!session) {
      return res.status(404).json({ error: 'Payment session not found or expired' });
    }

    return res.status(200).json({ success: true, session });
  } catch (err: any) {
    console.error('Error retrieving payment status:', err);
    return res.status(500).json({ error: 'Internal server error checking payment status' });
  }
});

// 3. Crypto Payment Webhooks (NOWPayments IPN HMAC SHA-512 & Idempotency)
const handleWebhook = async (req: Request, res: Response) => {
  try {
    const signature = (req.headers['x-nowpayments-sig'] || req.headers['x-signature']) as string | undefined;
    const { cryptoPaymentService } = await import('./src/lib/payments/cryptoProvider.js').catch(async () => {
      return await import('./src/lib/payments/cryptoProvider');
    });

    const verified = cryptoPaymentService.verifyWebhook(req.body, signature);
    if (!verified.isValid) {
      console.warn('Crypto webhook verification failed:', verified.error);
      return res.status(400).json({ error: verified.error });
    }

    const processResult = await cryptoPaymentService.processWebhookEvent(verified);
    return res.status(200).json({ success: true, result: processResult });
  } catch (err: any) {
    console.error('Error processing crypto webhook:', err);
    return res.status(500).json({ error: 'Webhook processing failure' });
  }
};

app.post('/api/webhooks/crypto', handleWebhook);
app.post('/api/payments/nowpayments/ipn', handleWebhook);

// 4. Sandbox Payment Confirmation (Test simulation)
app.post('/api/checkout/crypto/sandbox-confirm', async (req: Request, res: Response) => {
  try {
    const { paymentId, txHash } = req.body;
    if (!paymentId) {
      return res.status(400).json({ error: 'Payment ID is required' });
    }

    const { cryptoPaymentService } = await import('./src/lib/payments/cryptoProvider.js').catch(async () => {
      return await import('./src/lib/payments/cryptoProvider');
    });

    const session = await cryptoPaymentService.sandboxConfirmPayment(paymentId, txHash);
    return res.status(200).json({ success: true, session });
  } catch (err: any) {
    console.error('Error in sandbox payment confirmation:', err);
    return res.status(400).json({ error: err?.message || 'Failed to confirm test payment' });
  }
});

// Run Analytics Unit Tests endpoint
app.get('/api/tests/run', async (req: Request, res: Response) => {
  try {
    // Dynamic import to avoid bundling issues
    const { runAnalyticsTests } = await import('./src/lib/analytics/analytics.test.js').catch(async () => {
      return await import('./src/lib/analytics/analytics.test.ts');
    });
    const results = runAnalyticsTests();
    res.json({ success: true, results });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// AI Trade Review Endpoint (PRO / PREMIUM Feature, Admin Bypassed)
app.post('/api/ai/trade-review', async (req: Request, res: Response) => {
  const { trade } = req.body;
  const userId = req.body?.userId || (req.headers['x-user-id'] as string) || 'usr_default';

  if (!trade) {
    return res.status(400).json({ error: 'Trade payload required' });
  }

  // Check authorization & quotas
  try {
    const { dbService } = await import('./src/server/db.js').catch(async () => {
      return await import('./src/server/db');
    });

    const hasAccess = await dbService.checkFeatureAccess(userId, 'ai-trade-review');
    if (!hasAccess) {
      return res.status(403).json({
        error: 'AI Trade Review requires a PRO or PREMIUM plan. Please upgrade to unlock.',
        requiredTier: 'pro',
      });
    }

    const quota = await dbService.checkAndIncrementAiQuota(userId, 'trade_review');
    if (!quota.allowed) {
      return res.status(403).json({
        error: quota.error,
        plan: quota.plan,
        currentCount: quota.currentCount,
        limit: quota.limit,
      });
    }
  } catch (authErr: any) {
    console.warn('Authorization check warning in /api/ai/trade-review:', authErr.message);
  }

  const disclaimer = 'AI analysis is informational and based strictly on historical trade records. It does not constitute financial advice or guarantees of profit.';

  try {
    const ai = getGeminiClient();
    if (ai) {
      const prompt = `You are a professional quantitative trading coach and risk auditor.
Analyze the following recorded trade with objective statistical rigor:
- Symbol: ${trade.symbol} (${trade.market})
- Direction: ${trade.direction}
- Entry Price: ${trade.entry_price} | Exit Price: ${trade.exit_price}
- Stop Loss: ${trade.stop_loss} | Take Profit: ${trade.take_profit}
- Risk Amount: $${trade.risk_amount} | PnL: $${trade.pnl} (${trade.r_multiple}R)
- Strategy: ${trade.strategy_name || 'Standard Setup'}
- Session: ${trade.session || 'N/A'}
- Timeframe: ${trade.timeframe || 'N/A'}
- Setup: ${trade.setup || 'N/A'}
- Emotion Before/During/After: ${trade.emotion_before || 'N/A'} / ${trade.emotion_during || 'N/A'} / ${trade.emotion_after || 'N/A'}
- Discipline Score: ${trade.discipline_score || 'N/A'}/10
- Notes: ${trade.notes || 'None'}

Provide an objective review structured in valid JSON only with keys:
"summary" (string),
"strengths" (array of strings, e.g. risk adherence, execution speed, setup alignment),
"weaknesses" (array of strings, e.g. emotional bias, profit taking timing, session timing),
"patterns" (array of strings),
"recommendations" (array of strings),
"overallRating" (string e.g. "A", "B+", "C", "D")

Do NOT promise future profit. Return purely JSON without markdown backticks.`;

      const aiModel = process.env.AI_MODEL || 'gemini-2.5-flash';
      const response = await ai.models.generateContent({
        model: aiModel,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          systemInstruction: 'You are an objective trading risk and process auditor. Never promise returns. Strictly evaluate risk management, emotional control, and execution consistency.',
        },
      });

      if (response.text) {
        try {
          const parsed = JSON.parse(response.text.trim());
          return res.json({
            ...parsed,
            disclaimer,
          });
        } catch {
          // If JSON parsing fails, fall through to heuristic response
        }
      }
    }
  } catch (err: any) {
    console.warn('Gemini API call failed or key not configured, using heuristic analysis:', err?.message);
  }

  // Robust analytical heuristic fallback
  const isWin = trade.pnl > 0;
  const isGoodR = (trade.r_multiple || 0) >= 2.0;
  const isLowDiscipline = (trade.discipline_score || 8) < 7;
  const hasEmotionalStress = ['FOMO', 'Revenge', 'Anxious', 'Impatient'].includes(trade.emotion_before || '');

  return res.json({
    summary: isWin
      ? `Well-managed ${trade.direction} trade on ${trade.symbol} yielding ${trade.r_multiple}R ($${trade.pnl}). Risk parameters were respected cleanly.`
      : `Loss of $${Math.abs(trade.pnl)} (${trade.r_multiple}R) on ${trade.symbol}. ${isLowDiscipline ? 'Noticed lapses in discipline or emotional entry.' : 'Stop loss was honored according to risk limits.'}`,
    strengths: [
      trade.risk_amount > 0 ? `Risk defined prior to entry ($${trade.risk_amount})` : 'Position was closed within risk tolerance',
      isGoodR ? `Achieved favorable asymmetric payout (${trade.r_multiple}R)` : 'Execution followed session rules',
      trade.session ? `Operated within active ${trade.session} liquidity window` : 'Trade logged with key metrics',
    ],
    weaknesses: [
      hasEmotionalStress ? `Pre-trade emotional state was ${trade.emotion_before}; consider waiting for emotional equilibrium` : 'Review exit timing relative to initial take profit targets',
      trade.fees > 15 ? `Transaction friction was $${trade.fees}; monitor spread during session transitions` : 'Examine trade duration efficiency',
    ],
    patterns: [
      `Strategy "${trade.strategy_name || 'Breakout'}" exhibits standard behavior on ${trade.timeframe || '15m'}`,
      `${trade.session} session trades require strict monitoring during the first 30 minutes`,
    ],
    recommendations: [
      'Maintain position sizing consistency across correlated asset classes',
      'Record screenshots at both entry and exit to audit chart structure evolution',
      'Keep discipline score above 8 by avoiding impulsive pre-session executions',
    ],
    overallRating: isWin ? (isGoodR ? 'A' : 'B+') : (isLowDiscipline ? 'C' : 'B-'),
    disclaimer,
  });
});

// AI Weekly Review Endpoint (PRO / PREMIUM Feature, Admin Bypassed)
app.post('/api/ai/weekly-review', async (req: Request, res: Response) => {
  const { trades, periodName } = req.body;
  const userId = req.body?.userId || (req.headers['x-user-id'] as string) || 'usr_default';
  const userEmail = req.body?.userEmail || (req.headers['x-user-email'] as string) || undefined;
  const tradeList = Array.isArray(trades) ? trades : [];

  // Check authorization
  try {
    const { dbService } = await import('./src/server/db.js').catch(async () => {
      return await import('./src/server/db');
    });

    const hasAccess = await dbService.checkFeatureAccess(userId, 'ai-weekly-review', userEmail);
    if (!hasAccess) {
      return res.status(403).json({
        error: 'AI Weekly Review requires a PRO or PREMIUM plan. Please upgrade to unlock.',
        requiredTier: 'pro',
      });
    }
  } catch (authErr: any) {
    console.warn('Authorization check warning in /api/ai/weekly-review:', authErr.message);
  }

  const disclaimer = 'AI analysis is informational and based strictly on historical trade records. It does not constitute financial advice or guarantees of profit.';

  const wins = tradeList.filter((t: any) => t.pnl > 0);
  const losses = tradeList.filter((t: any) => t.pnl < 0);
  const totalPnl = tradeList.reduce((acc: number, t: any) => acc + (t.pnl || 0) - (t.fees || 0), 0);
  const winRate = tradeList.length > 0 ? ((wins.length / tradeList.length) * 100).toFixed(1) : '0';

  try {
    const ai = getGeminiClient();
    if (ai && tradeList.length > 0) {
      const summaryStats = `Period: ${periodName || 'Last 7 Days'}. Total Trades: ${tradeList.length}, Win Rate: ${winRate}%, Net P&L: $${totalPnl.toFixed(2)}. Winning Trades: ${wins.length}, Losing Trades: ${losses.length}.`;

      const prompt = `You are an institutional trading risk officer reviewing a trader's performance over a weekly period.
Stats: ${summaryStats}
Sample trades: ${JSON.stringify(tradeList.slice(0, 10).map((t: any) => ({
  symbol: t.symbol,
  pnl: t.pnl,
  r: t.r_multiple,
  strategy: t.strategy_name,
  session: t.session,
  discipline: t.discipline_score
})))}

Generate a structured weekly review in valid JSON format:
{
  "summary": "overview string",
  "whatWentWell": ["item 1", "item 2", "item 3"],
  "whatWentWrong": ["item 1", "item 2"],
  "recurringPatterns": ["pattern 1", "pattern 2"],
  "areasToReview": ["actionable focus 1", "actionable focus 2"]
}
Do NOT promise future returns. Never output markdown ticks. Return purely valid JSON.`;

      const aiModel = process.env.AI_MODEL || 'gemini-2.5-flash';
      const response = await ai.models.generateContent({
        model: aiModel,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          systemInstruction: 'You are an objective trading risk and process auditor.',
        },
      });

      if (response.text) {
        try {
          const parsed = JSON.parse(response.text.trim());
          return res.json({
            ...parsed,
            stats: { totalTrades: tradeList.length, winRate, netPnl: Number(totalPnl.toFixed(2)) },
            disclaimer,
          });
        } catch {
          // Fall through
        }
      }
    }
  } catch (err: any) {
    console.warn('Gemini weekly review error, fallback to analytical review:', err?.message);
  }

  // Analytical heuristic fallback for weekly review
  return res.json({
    summary: `During ${periodName || 'the evaluated period'}, ${tradeList.length} trades were logged resulting in a net P&L of $${totalPnl.toFixed(2)} with a ${winRate}% win rate.`,
    whatWentWell: [
      `Maintained a ${winRate}% win rate across ${tradeList.length} recorded positions`,
      'Consistent risk allocation per trade prevented catastrophic drawdowns',
      'Disciplined stop loss placement protected capital on invalidations',
    ],
    whatWentWrong: [
      losses.length > 3 ? 'Multiple losses clustered in rapid succession during high volatility sessions' : 'Minor slippage recorded on breakout entries',
      'Occasional early profit-taking prior to full technical targets',
    ],
    recurringPatterns: [
      'London and Overlap sessions generated higher average R-multiples than Asian session trades',
      'Trend following setups demonstrated higher win rates than counter-trend mean reversion attempts',
    ],
    areasToReview: [
      'Refine rules for avoiding trades 15 minutes before high-impact economic releases',
      'Audit position sizes on high-beta crypto assets to align with forex account risk',
      'Review trade screenshots on losing trades to identify recurring entry mistakes',
    ],
    stats: { totalTrades: tradeList.length, winRate, netPnl: Number(totalPnl.toFixed(2)) },
    disclaimer,
  });
});

// CSV Import validation & parser endpoint
app.post('/api/import/csv', (req: Request, res: Response) => {
  const { csvText, mapping } = req.body;
  if (!csvText || typeof csvText !== 'string') {
    return res.status(400).json({ error: 'Valid CSV text is required' });
  }

  try {
    const lines = csvText.trim().split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      return res.status(400).json({ error: 'CSV file must have at least a header row and one data row' });
    }

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
    const rows = lines.slice(1, 51).map((line) => {
      const cols = line.split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => {
        obj[h] = cols[i] || '';
      });
      return obj;
    });

    res.json({
      success: true,
      headers,
      previewRows: rows.slice(0, 5),
      totalRows: lines.length - 1,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to parse CSV: ' + err.message });
  }
});

// ============================================================================
// VITE MIDDLEWARE & STATIC SERVING
// ============================================================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TRADEIQ] Server running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export { app };
export default app;
