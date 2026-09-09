export type ImpactLevel = 'high' | 'medium' | 'low';

export type CurrencyCode =
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'JPY'
  | 'CAD'
  | 'AUD'
  | 'NZD'
  | 'CHF';

export interface EconomicEvent {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "08:30 AM", "All Day", "14:15"
  currency: CurrencyCode;
  countryName: string;
  flag: string;
  event: string;
  impact: ImpactLevel;
  forecast: string;
  previous: string;
  actual: string; // "—" or value
  status?: 'completed' | 'live' | 'upcoming';
  beatMiss?: 'better' | 'worse' | 'inline' | 'pending';
  category?: 'inflation' | 'central-bank' | 'employment' | 'growth' | 'sentiment' | 'housing';
  affectedPairs?: string[];
  description?: string;
}

export interface DayEconomicSchedule {
  dateStr: string; // YYYY-MM-DD
  dayName: string; // "Monday", "Tuesday", etc.
  formattedDate: string; // "Monday, September 7, 2026"
  isToday: boolean;
  events: EconomicEvent[];
}

export interface WeekRange {
  startDate: Date;
  endDate: Date;
  label: string; // "Sep 7 — Sep 13, 2026"
}
