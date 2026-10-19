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

export type CalendarTimezone = 'ET' | 'UTC' | 'CET' | 'WAT';

export interface EconomicEvent {
  id: string;
  date: string; // YYYY-MM-DD
  rawDate?: string; // Original ISO timestamp from feed (e.g. 2026-10-18T10:15:00-04:00)
  time: string; // Formatted time
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
