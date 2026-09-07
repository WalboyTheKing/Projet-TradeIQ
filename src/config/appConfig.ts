// ============================================================================
// APPLICATION CONFIGURATION
// Allows easy rebranding and global parameter management
// ============================================================================

export const APP_CONFIG = {
  name: 'TRADEIQ',
  tagline: 'Professional Trade Analytics & Performance Journal',
  version: '1.0.0',
  brandColor: '#10B981', // Emerald terminal accent
  darkBg: '#090D14',
  cardBg: '#0F172A',
  currencies: [
    { code: 'USD', symbol: '$', label: 'US Dollar ($)' },
    { code: 'EUR', symbol: '€', label: 'Euro (€)' },
    { code: 'GBP', symbol: '£', label: 'British Pound (£)' },
    { code: 'JPY', symbol: '¥', label: 'Japanese Yen (¥)' },
    { code: 'CHF', symbol: 'CHF', label: 'Swiss Franc (CHF)' },
    { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar (C$)' },
    { code: 'AUD', symbol: 'A$', label: 'Australian Dollar (A$)' },
  ],
  markets: ['Forex', 'Crypto', 'Indices', 'Commodities', 'Stocks'] as const,
  sessions: ['Asia', 'London', 'New York', 'Overlap'] as const,
  timeframes: ['1m', '5m', '15m', '30m', '1h', '4h', 'Daily'] as const,
  emotions: ['Calm', 'Confident', 'Anxious', 'FOMO', 'Impatient', 'Revenge', 'Disciplined', 'Relaxed'] as const,
  mistakesList: [
    'Chased entry (FOMO)',
    'Widened or removed Stop Loss',
    'Exited prematurely before TP',
    'Overleveraged position size',
    'Revenge traded after loss',
    'Traded outside trading session',
    'Ignored high-impact news',
    'Hesitated on valid signal',
  ] as const,
  plans: {
    free: {
      name: 'Free',
      price: 0,
      tradeLimit: 50,
      features: ['Up to 50 trades', 'Basic statistics & journal', 'Standard dashboard', 'Community support'],
    },
    pro: {
      name: 'Pro',
      price: 29,
      tradeLimit: Infinity,
      features: ['Unlimited trades', 'Advanced statistics & analytics', 'CSV & Excel import', 'AI Trade Review', 'Calendar heatmap', 'Strategy rankings'],
    },
    premium: {
      name: 'Premium',
      price: 79,
      tradeLimit: Infinity,
      features: ['Everything in Pro', 'Weekly Deep AI Reports', 'PDF export & audit sheets', 'Multi-account tracking', 'Priority AI processing'],
    },
  },
  aiDisclaimer: 'AI analysis is informational and based strictly on recorded historical data. It does not constitute financial advice or promises of future profits.',
};
