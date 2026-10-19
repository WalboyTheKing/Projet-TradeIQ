export type ImpactLevel = 'high' | 'medium' | 'low';

export type CurrencyCode =
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'JPY'
  | 'CAD'
  | 'AUD'
  | 'NZD'
  | 'CHF'
  | 'CNY'
  | 'ALL';

export type CalendarTimezone = 'ET' | 'UTC' | 'CET' | 'WAT';

export interface EconomicEvent {
  id: string;
  date: string; // YYYY-MM-DD in selected/default timezone
  rawDate?: string; // Original ISO timestamp from feed (e.g. 2026-10-18T10:15:00-04:00)
  timestamp?: number; // UTC timestamp in milliseconds for exact chronological comparisons
  time: string; // Formatted time (e.g. "08:30 AM" or "All Day")
  currency: CurrencyCode;
  countryName: string;
  flag: string;
  event: string;
  impact: ImpactLevel;
  forecast: string;
  previous: string;
  actual: string; // "—" or actual value (numeric zero "0" is preserved, not converted to dash)
  status?: 'completed' | 'live' | 'upcoming';
  beatMiss?: 'better' | 'worse' | 'inline' | 'pending';
  category?: 'inflation' | 'central-bank' | 'employment' | 'growth' | 'sentiment' | 'housing';
  affectedPairs?: string[];
  description?: string;
  rawCountry?: string; // Exact country code from feed
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
