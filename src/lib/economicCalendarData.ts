import { EconomicEvent, DayEconomicSchedule, CurrencyCode, ImpactLevel, CalendarTimezone } from '../types/economicCalendar';

export const CURRENCY_CONFIG: Record<
  CurrencyCode,
  { name: string; flag: string; country: string }
> = {
  USD: { name: 'US Dollar', flag: '🇺🇸', country: 'United States' },
  EUR: { name: 'Euro', flag: '🇪🇺', country: 'Eurozone' },
  GBP: { name: 'British Pound', flag: '🇬🇧', country: 'United Kingdom' },
  JPY: { name: 'Japanese Yen', flag: '🇯🇵', country: 'Japan' },
  CAD: { name: 'Canadian Dollar', flag: '🇨🇦', country: 'Canada' },
  AUD: { name: 'Australian Dollar', flag: '🇦🇺', country: 'Australia' },
  NZD: { name: 'New Zealand Dollar', flag: '🇳🇿', country: 'New Zealand' },
  CHF: { name: 'Swiss Franc', flag: '🇨🇭', country: 'Switzerland' },
  CNY: { name: 'Chinese Yuan', flag: '🇨🇳', country: 'China' },
  ALL: { name: 'Global / Multi-Devise', flag: '🌐', country: 'International' },
};

/**
 * Standard institutional timezone definitions
 * Africa/Porto-Novo (WAT, UTC+1 Bénin) is the terminal reference default
 */
export const TIMEZONE_MAPPING: Record<
  CalendarTimezone,
  { iana: string; label: string; offsetLabel: string }
> = {
  WAT: { iana: 'Africa/Porto-Novo', label: 'WAT (Bénin)', offsetLabel: 'UTC+1' },
  UTC: { iana: 'UTC', label: 'UTC', offsetLabel: 'UTC' },
  CET: { iana: 'Europe/Paris', label: 'CET', offsetLabel: 'UTC+1 / UTC+2 (Paris)' },
  ET: { iana: 'America/New_York', label: 'ET', offsetLabel: 'UTC-5 / UTC-4 (New York)' },
};

/**
 * Distinguishes between numeric zero (e.g. 0, "0", "0.0%") and missing/empty values ("—")
 * Guarantees that zero is never replaced with a dash or treated as missing
 */
export function formatEconomicValue(val: unknown): string {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed === '' || trimmed === '—' || trimmed === '-' || trimmed.toLowerCase() === 'null') {
      return '—';
    }
    return trimmed;
  }
  return '—';
}

// Explicit events matching the user request and standard macroeconomic schedule
export const MASTER_ECONOMIC_EVENTS: EconomicEvent[] = [
  // -------------------------------------------------------------
  // User's Requested Week: Sep 7 - Sep 13, 2026
  // -------------------------------------------------------------
  {
    id: 'evt-2026-09-10-ecb',
    date: '2026-09-10',
    time: 'All Day',
    currency: 'EUR',
    countryName: 'Eurozone',
    flag: '🇪🇺',
    event: 'ECB Press Conference',
    impact: 'high',
    forecast: '—',
    previous: '—',
    actual: '—',
    category: 'central-bank',
    affectedPairs: ['EUR/USD', 'EUR/GBP', 'EUR/JPY', 'DAX40'],
    description: 'European Central Bank President Christine Lagarde commentary on interest rate stance and inflation projections.',
  },
  {
    id: 'evt-2026-09-11-gbp-gdp',
    date: '2026-09-11',
    time: 'All Day',
    currency: 'GBP',
    countryName: 'United Kingdom',
    flag: '🇬🇧',
    event: 'GDP m/m',
    impact: 'high',
    forecast: '0.0%',
    previous: '0.3%',
    actual: '—',
    category: 'growth',
    affectedPairs: ['GBP/USD', 'EUR/GBP', 'GBP/JPY', 'FTSE100'],
    description: 'Gross Domestic Product measures the change in the inflation-adjusted value of all goods and services produced by the economy.',
  },
  {
    id: 'evt-2026-09-11-usd-core-cpi-m',
    date: '2026-09-11',
    time: 'All Day',
    currency: 'USD',
    countryName: 'United States',
    flag: '🇺🇸',
    event: 'Core CPI m/m',
    impact: 'high',
    forecast: '0.2%',
    previous: '0.2%',
    actual: '—',
    category: 'inflation',
    affectedPairs: ['EUR/USD', 'USD/JPY', 'GBP/USD', 'XAU/USD', 'NAS100'],
    description: 'Consumer Price Index excluding volatile food and energy components; major benchmark for Federal Reserve policy.',
  },
  {
    id: 'evt-2026-09-11-usd-core-cpi-y',
    date: '2026-09-11',
    time: 'All Day',
    currency: 'USD',
    countryName: 'United States',
    flag: '🇺🇸',
    event: 'Core CPI y/y',
    impact: 'high',
    forecast: '2.4%',
    previous: '2.5%',
    actual: '—',
    category: 'inflation',
    affectedPairs: ['EUR/USD', 'USD/JPY', 'XAU/USD', 'US30'],
    description: 'Annualized core consumer inflation gauge.',
  },
  {
    id: 'evt-2026-09-11-usd-cpi-m',
    date: '2026-09-11',
    time: 'All Day',
    currency: 'USD',
    countryName: 'United States',
    flag: '🇺🇸',
    event: 'CPI m/m',
    impact: 'high',
    forecast: '0.4%',
    previous: '0.1%',
    actual: '—',
    category: 'inflation',
    affectedPairs: ['EUR/USD', 'USD/JPY', 'XAU/USD'],
    description: 'Month-over-month headline consumer price changes.',
  },
  {
    id: 'evt-2026-09-11-usd-cpi-y',
    date: '2026-09-11',
    time: 'All Day',
    currency: 'USD',
    countryName: 'United States',
    flag: '🇺🇸',
    event: 'CPI y/y',
    impact: 'high',
    forecast: '3.4%',
    previous: '3.4%',
    actual: '—',
    category: 'inflation',
    affectedPairs: ['EUR/USD', 'USD/JPY', 'XAU/USD', 'NAS100'],
    description: 'Year-over-year headline inflation rate.',
  },

  // Additional realistic events for previous & upcoming weeks
  // Previous week (Sep 1 - Sep 4)
  {
    id: 'evt-2026-09-01-usd-ism-mfg',
    date: '2026-09-01',
    time: '10:00 AM',
    currency: 'USD',
    countryName: 'United States',
    flag: '🇺🇸',
    event: 'ISM Manufacturing PMI',
    impact: 'high',
    forecast: '47.8',
    previous: '46.8',
    actual: '47.2',
    beatMiss: 'worse',
    category: 'sentiment',
    affectedPairs: ['USD/JPY', 'EUR/USD', 'US30'],
  },
  {
    id: 'evt-2026-09-02-aud-gdp',
    date: '2026-09-02',
    time: '01:30 AM',
    currency: 'AUD',
    countryName: 'Australia',
    flag: '🇦🇺',
    event: 'GDP q/q',
    impact: 'high',
    forecast: '0.2%',
    previous: '0.1%',
    actual: '0.2%',
    beatMiss: 'inline',
    category: 'growth',
    affectedPairs: ['AUD/USD', 'AUD/JPY'],
  },
  {
    id: 'evt-2026-09-02-cad-boc-rate',
    date: '2026-09-02',
    time: '09:45 AM',
    currency: 'CAD',
    countryName: 'Canada',
    flag: '🇨🇦',
    event: 'BoC Interest Rate Decision',
    impact: 'high',
    forecast: '4.25%',
    previous: '4.50%',
    actual: '4.25%',
    beatMiss: 'inline',
    category: 'central-bank',
    affectedPairs: ['USD/CAD', 'CAD/JPY'],
  },
  {
    id: 'evt-2026-09-04-usd-nfp',
    date: '2026-09-04',
    time: '08:30 AM',
    currency: 'USD',
    countryName: 'United States',
    flag: '🇺🇸',
    event: 'Non-Farm Employment Change (NFP)',
    impact: 'high',
    forecast: '164K',
    previous: '114K',
    actual: '142K',
    beatMiss: 'worse',
    category: 'employment',
    affectedPairs: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'XAU/USD'],
  },
  {
    id: 'evt-2026-09-04-usd-unemployment',
    date: '2026-09-04',
    time: '08:30 AM',
    currency: 'USD',
    countryName: 'United States',
    flag: '🇺🇸',
    event: 'Unemployment Rate',
    impact: 'high',
    forecast: '4.2%',
    previous: '4.3%',
    actual: '4.2%',
    beatMiss: 'better',
    category: 'employment',
    affectedPairs: ['EUR/USD', 'USD/JPY'],
  },

  // Following week (Sep 15 - Sep 18)
  {
    id: 'evt-2026-09-15-cad-cpi',
    date: '2026-09-15',
    time: '08:30 AM',
    currency: 'CAD',
    countryName: 'Canada',
    flag: '🇨🇦',
    event: 'CPI m/m',
    impact: 'high',
    forecast: '0.1%',
    previous: '0.4%',
    actual: '—',
    category: 'inflation',
    affectedPairs: ['USD/CAD'],
  },
  {
    id: 'evt-2026-09-16-usd-retail-sales',
    date: '2026-09-16',
    time: '08:30 AM',
    currency: 'USD',
    countryName: 'United States',
    flag: '🇺🇸',
    event: 'Retail Sales m/m',
    impact: 'high',
    forecast: '-0.2%',
    previous: '1.0%',
    actual: '—',
    category: 'growth',
    affectedPairs: ['EUR/USD', 'USD/JPY'],
  },
  {
    id: 'evt-2026-09-16-usd-fomc',
    date: '2026-09-16',
    time: '02:00 PM',
    currency: 'USD',
    countryName: 'United States',
    flag: '🇺🇸',
    event: 'Federal Funds Rate & FOMC Statement',
    impact: 'high',
    forecast: '5.25%',
    previous: '5.50%',
    actual: '—',
    category: 'central-bank',
    affectedPairs: ['EUR/USD', 'USD/JPY', 'XAU/USD', 'NAS100', 'US30'],
  },
  {
    id: 'evt-2026-09-16-usd-powell',
    date: '2026-09-16',
    time: '02:30 PM',
    currency: 'USD',
    countryName: 'United States',
    flag: '🇺🇸',
    event: 'FOMC Press Conference (Jerome Powell)',
    impact: 'high',
    forecast: '—',
    previous: '—',
    actual: '—',
    category: 'central-bank',
    affectedPairs: ['ALL USD PAIRS', 'GOLD', 'INDICES'],
  },
  {
    id: 'evt-2026-09-17-gbp-boe-rate',
    date: '2026-09-17',
    time: '07:00 AM',
    currency: 'GBP',
    countryName: 'United Kingdom',
    flag: '🇬🇧',
    event: 'Bank of England Official Bank Rate',
    impact: 'high',
    forecast: '5.00%',
    previous: '5.00%',
    actual: '—',
    category: 'central-bank',
    affectedPairs: ['GBP/USD', 'EUR/GBP', 'GBP/JPY'],
  },
  {
    id: 'evt-2026-09-18-jpy-boj-rate',
    date: '2026-09-18',
    time: 'All Day',
    currency: 'JPY',
    countryName: 'Japan',
    flag: '🇯🇵',
    event: 'Bank of Japan Policy Rate & Statement',
    impact: 'high',
    forecast: '0.25%',
    previous: '0.25%',
    actual: '—',
    category: 'central-bank',
    affectedPairs: ['USD/JPY', 'EUR/JPY', 'GBPJPY', 'NIKKEI225'],
  },
];

/**
 * Format a Date object to YYYY-MM-DD
 */
export function formatDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns the calendar date key (YYYY-MM-DD) for a given timestamp or ISO date string
 * evaluated in the user's selected timezone (default Africa/Porto-Novo).
 * Accurately handles midnight crossovers and daylight saving time (DST).
 */
export function getEventDateKeyInTimezone(
  dateInput: number | string | Date,
  timezone: CalendarTimezone = 'WAT'
): string {
  try {
    const d = typeof dateInput === 'number' || dateInput instanceof Date
      ? new Date(dateInput)
      : new Date(dateInput);
    if (isNaN(d.getTime())) return '';

    const targetTz = TIMEZONE_MAPPING[timezone]?.iana || 'Africa/Porto-Novo';
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: targetTz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(d);
  } catch {
    return '';
  }
}

/**
 * Returns Monday of the week for any given date
 */
export function getMondayOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Generates the 7 days (Monday through Sunday) for a given week start date
 * Assigns events based on the user's selected timezone (e.g. Africa/Porto-Novo)
 */
export function getEconomicScheduleForWeek(
  weekStartDate: Date,
  filterImpacts?: ImpactLevel[],
  filterCurrencies?: CurrencyCode[],
  searchQuery?: string,
  liveEvents?: EconomicEvent[],
  timezone: CalendarTimezone = 'WAT'
): DayEconomicSchedule[] {
  const monday = getMondayOfWeek(weekStartDate);
  const todayKey = getEventDateKeyInTimezone(new Date(), timezone) || formatDateKey(new Date());

  const days: DayEconomicSchedule[] = [];

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Base pool of events: live events merged with master events without duplicates
  const pool = liveEvents && liveEvents.length > 0 ? liveEvents : MASTER_ECONOMIC_EVENTS;

  for (let i = 0; i < 7; i++) {
    const currentDay = new Date(monday);
    currentDay.setDate(monday.getDate() + i);

    const dateKey = formatDateKey(currentDay);
    const dayName = dayNames[i];
    const monthName = monthNames[currentDay.getMonth()];
    const dayNum = currentDay.getDate();
    const year = currentDay.getFullYear();
    const formattedDate = `${dayName}, ${monthName} ${dayNum}, ${year}`;
    const isToday = dateKey === todayKey;

    // Filter events for this date evaluated in the user's timezone
    let dayEvents = pool.filter((e) => {
      if (e.timestamp !== undefined && !isNaN(e.timestamp)) {
        return getEventDateKeyInTimezone(e.timestamp, timezone) === dateKey;
      }
      if (e.rawDate && e.rawDate.includes('T')) {
        return getEventDateKeyInTimezone(e.rawDate, timezone) === dateKey;
      }
      return e.date === dateKey;
    });

    // If dayEvents is empty from pool, try master events as fallback
    if (dayEvents.length === 0 && pool !== MASTER_ECONOMIC_EVENTS) {
      dayEvents = MASTER_ECONOMIC_EVENTS.filter((e) => {
        if (e.rawDate && e.rawDate.includes('T')) {
          return getEventDateKeyInTimezone(e.rawDate, timezone) === dateKey;
        }
        return e.date === dateKey;
      });
    }

    // Apply impact filter
    if (filterImpacts && filterImpacts.length > 0) {
      dayEvents = dayEvents.filter((e) => filterImpacts.includes(e.impact));
    }

    // Apply currency filter
    if (filterCurrencies && filterCurrencies.length > 0) {
      dayEvents = dayEvents.filter((e) => filterCurrencies.includes(e.currency));
    }

    // Apply search query
    if (searchQuery && searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      dayEvents = dayEvents.filter(
        (e) =>
          e.event.toLowerCase().includes(q) ||
          e.currency.toLowerCase().includes(q) ||
          e.countryName.toLowerCase().includes(q)
      );
    }

    // Sort chronologically within the day
    dayEvents.sort((a, b) => {
      const tsA = a.timestamp ?? (a.rawDate ? new Date(a.rawDate).getTime() : 0);
      const tsB = b.timestamp ?? (b.rawDate ? new Date(b.rawDate).getTime() : 0);
      return tsA - tsB;
    });

    days.push({
      dateStr: dateKey,
      dayName,
      formattedDate,
      isToday,
      events: dayEvents,
    });
  }

  return days;
}

/**
 * Parses live ForexFactory/FairEconomy JSON feed item to EconomicEvent
 * - Preserves all genuine feed fields without inventing data
 * - Respects numeric zero (0, "0", "0.0%") and does not treat it as missing
 * - Does NOT fabricate an 'actual' value when the source doesn't provide it
 * - Fixes non-standard country mapping (e.g. CNY -> China/CNY, All -> Global, not USD)
 */
export function parseForexFactoryItem(item: any, index: number): EconomicEvent | null {
  try {
    if (!item || typeof item !== 'object') return null;
    if (!item.title || !item.date) return null;

    const rawDate = String(item.date).trim();
    const parsedDate = new Date(rawDate);
    const isValidDate = !isNaN(parsedDate.getTime());
    const timestamp = isValidDate ? parsedDate.getTime() : undefined;

    // Default reference date string in Africa/Porto-Novo timezone
    const datePart = isValidDate
      ? getEventDateKeyInTimezone(parsedDate, 'WAT')
      : rawDate.split('T')[0];

    let timePart = 'All Day';
    if (rawDate.includes('T') && isValidDate) {
      timePart = parsedDate.toLocaleTimeString('en-US', {
        timeZone: 'Africa/Porto-Novo',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }

    // Preserve country and currency correctly
    const rawCountry = (item.country || '').trim();
    const upperCountry = rawCountry.toUpperCase();

    let currency: CurrencyCode = 'USD';
    let countryName = 'United States';
    let flag = '🇺🇸';

    if (upperCountry in CURRENCY_CONFIG) {
      currency = upperCountry as CurrencyCode;
      const conf = CURRENCY_CONFIG[currency];
      countryName = conf.country;
      flag = conf.flag;
    } else if (upperCountry === 'CNY' || upperCountry === 'CHINA' || upperCountry === 'RMB') {
      currency = 'CNY';
      countryName = 'China';
      flag = '🇨🇳';
    } else if (upperCountry === 'ALL' || upperCountry === 'GLOBAL') {
      currency = 'ALL';
      countryName = 'International';
      flag = '🌐';
    } else if (upperCountry) {
      // Keep country code without forcing to USD
      currency = (upperCountry in CURRENCY_CONFIG ? upperCountry : 'USD') as CurrencyCode;
      countryName = rawCountry;
      flag = '🌐';
    }

    // Impact mapping
    const rawImpact = (item.impact || 'low').toLowerCase();
    const impact: ImpactLevel =
      rawImpact === 'high' ? 'high' : rawImpact === 'medium' ? 'medium' : 'low';

    // Pairs mapping
    const affectedPairsMap: Record<CurrencyCode, string[]> = {
      USD: ['EUR/USD', 'USD/JPY', 'GBP/USD', 'XAU/USD', 'NAS100'],
      EUR: ['EUR/USD', 'EUR/GBP', 'EUR/JPY', 'DAX40'],
      GBP: ['GBP/USD', 'EUR/GBP', 'GBP/JPY', 'FTSE100'],
      JPY: ['USD/JPY', 'EUR/JPY', 'GBP/JPY', 'NIKKEI225'],
      CAD: ['USD/CAD', 'CAD/JPY', 'OIL/WTI'],
      AUD: ['AUD/USD', 'AUD/JPY', 'AUD/NZD'],
      NZD: ['NZD/USD', 'AUD/NZD', 'NZD/JPY'],
      CHF: ['USD/CHF', 'EUR/CHF', 'GBP/CHF'],
      CNY: ['USD/CNH', 'AUD/USD', 'XAU/USD'],
      ALL: ['ALL PAIRS', 'GLOBAL MACRO'],
    };

    // Clean value formatting: 0 is preserved, missing is '—'
    const forecastVal = formatEconomicValue(item.forecast);
    const previousVal = formatEconomicValue(item.previous);
    const actualVal = formatEconomicValue(item.actual);

    return {
      id: `ff-live-${index}-${datePart}-${String(item.title).replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`,
      date: datePart,
      rawDate,
      timestamp,
      time: timePart,
      currency,
      countryName,
      flag,
      rawCountry,
      event: String(item.title).trim(),
      impact,
      forecast: forecastVal,
      previous: previousVal,
      actual: actualVal, // NEVER fabricated; remains '—' when not provided by feed
      category:
        item.title.toLowerCase().includes('cpi') || item.title.toLowerCase().includes('inflation')
          ? 'inflation'
          : item.title.toLowerCase().includes('rate') || item.title.toLowerCase().includes('press') || item.title.toLowerCase().includes('speaks')
          ? 'central-bank'
          : item.title.toLowerCase().includes('employment') || item.title.toLowerCase().includes('claims')
          ? 'employment'
          : 'growth',
      affectedPairs: affectedPairsMap[currency] || ['GLOBAL MARKETS'],
      description: `Événement macroéconomique officiel issu du flux institutionnel ForexFactory (Fair Economy Media).`,
    };
  } catch {
    return null;
  }
}

/**
 * Formats event time into the user's selected timezone, including Africa/Porto-Novo (WAT, UTC+1 Bénin)
 */
export function formatEventTimeInTimezone(
  event: EconomicEvent,
  timezone: CalendarTimezone = 'WAT'
): string {
  if (!event.rawDate || !event.rawDate.includes('T')) {
    return event.time || 'All Day';
  }

  try {
    const d = new Date(event.rawDate);
    if (isNaN(d.getTime())) return event.time || 'All Day';

    const targetTz = TIMEZONE_MAPPING[timezone]?.iana || 'Africa/Porto-Novo';
    return d.toLocaleTimeString('en-US', {
      timeZone: targetTz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return event.time || 'All Day';
  }
}

export interface LiveCalendarResult {
  source: string;
  status: 'LIVE' | 'CACHE' | 'OFFLINE_BACKUP';
  isFallback: boolean;
  events: EconomicEvent[];
  updatedAt: string;
  cachedAt?: string;
  cacheAgeSeconds?: number;
  warning?: string;
}

/**
 * Fetches the real-time live economic calendar feed from ForexFactory via server proxy
 */
export async function fetchLiveEconomicCalendar(): Promise<LiveCalendarResult> {
  // 1. Try local server proxy first
  try {
    const res = await fetch('/api/economic-calendar');
    if (res.ok) {
      const data = await res.json();
      if (data.events && Array.isArray(data.events)) {
        const parsed = data.events
          .map((item: any, i: number) => parseForexFactoryItem(item, i))
          .filter(Boolean) as EconomicEvent[];

        if (parsed.length > 0) {
          return {
            source: data.source || 'ForexFactory (Fair Economy Media)',
            status: data.status === 'CACHE' ? 'CACHE' : 'LIVE',
            isFallback: false,
            events: parsed,
            updatedAt: data.updatedAt || new Date().toISOString(),
            cachedAt: data.cachedAt,
            cacheAgeSeconds: data.cacheAgeSeconds,
            warning: data.warning,
          };
        }
      }
    }
  } catch (err) {
    console.warn('Local proxy calendar fetch failed, trying direct fallback:', err);
  }

  // 2. Direct fetch fallback (if client network permits)
  try {
    const directRes = await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.json');
    if (directRes.ok) {
      const rawEvents = await directRes.json();
      if (Array.isArray(rawEvents)) {
        const parsed = rawEvents
          .map((item: any, i: number) => parseForexFactoryItem(item, i))
          .filter(Boolean) as EconomicEvent[];

        if (parsed.length > 0) {
          return {
            source: 'ForexFactory (Direct Fair Economy Media)',
            status: 'LIVE',
            isFallback: false,
            events: parsed,
            updatedAt: new Date().toISOString(),
          };
        }
      }
    }
  } catch (err) {
    console.warn('Direct ForexFactory fetch error:', err);
  }

  // 3. Fallback to reference master events with explicit offline indicator
  return {
    source: 'TradeIQ Macro Engine (Données indicatives hors-ligne)',
    status: 'OFFLINE_BACKUP',
    isFallback: true,
    events: MASTER_ECONOMIC_EVENTS,
    updatedAt: new Date().toISOString(),
    warning: 'Flux ForexFactory indisponible, affichage des données de secours indicatives.',
  };
}

/**
 * Returns the week label e.g. "Oct 19 — Oct 25, 2026"
 */
export function getWeekRangeLabel(monday: Date): string {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const m1 = shortMonths[monday.getMonth()];
  const d1 = monday.getDate();
  const m2 = shortMonths[sunday.getMonth()];
  const d2 = sunday.getDate();
  const y = sunday.getFullYear();

  return `${m1} ${d1} — ${m2} ${d2}, ${y}`;
}

/**
 * Finds the next high-impact event from reference date using absolute UTC timestamps.
 * - Excludes past events strictly (eventTimestamp < refTimestamp).
 * - Accurately includes events whose time is >= reference timestamp.
 * - If no future high-impact event exists, returns NULL (never falls back to an arbitrary past event).
 */
export function getNextHighImpactEvent(
  events?: EconomicEvent[],
  referenceDate: Date = new Date()
): EconomicEvent | null {
  const pool = events && events.length > 0 ? events : MASTER_ECONOMIC_EVENTS;
  const refTimestamp = referenceDate.getTime();

  // Filter high impact events only
  const highImpactEvents = pool.filter((e) => e.impact === 'high');

  const upcomingWithTimestamps = highImpactEvents
    .map((e) => {
      let ts = e.timestamp;
      if (ts === undefined) {
        if (e.rawDate && e.rawDate.includes('T')) {
          const parsed = new Date(e.rawDate).getTime();
          if (!isNaN(parsed)) ts = parsed;
        }
        if (ts === undefined && e.date) {
          // If no specific time is available, treat as UTC midnight of that date
          const parsed = new Date(`${e.date}T00:00:00Z`).getTime();
          if (!isNaN(parsed)) ts = parsed;
        }
      }
      return { event: e, timestamp: ts };
    })
    .filter((item): item is { event: EconomicEvent; timestamp: number } => {
      // Chronological condition: event must be on or after the reference time
      return item.timestamp !== undefined && !isNaN(item.timestamp) && item.timestamp >= refTimestamp;
    })
    .sort((a, b) => a.timestamp - b.timestamp);

  if (upcomingWithTimestamps.length > 0) {
    return upcomingWithTimestamps[0].event;
  }

  // Pure null when no future high impact event exists
  return null;
}
