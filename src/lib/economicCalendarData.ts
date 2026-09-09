import { EconomicEvent, DayEconomicSchedule, CurrencyCode, ImpactLevel } from '../types/economicCalendar';

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
};

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
 */
export function getEconomicScheduleForWeek(
  weekStartDate: Date,
  filterImpacts?: ImpactLevel[],
  filterCurrencies?: CurrencyCode[],
  searchQuery?: string
): DayEconomicSchedule[] {
  const monday = getMondayOfWeek(weekStartDate);
  const todayKey = formatDateKey(new Date());

  const days: DayEconomicSchedule[] = [];

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

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

    // Filter master events for this date
    let dayEvents = MASTER_ECONOMIC_EVENTS.filter((e) => e.date === dateKey);

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
 * Returns the week label e.g. "Sep 7 — Sep 13, 2026"
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

  if (m1 === m2) {
    return `${m1} ${d1} — ${m2} ${d2}, ${y}`;
  }
  return `${m1} ${d1} — ${m2} ${d2}, ${y}`;
}

/**
 * Finds the next high-impact event from current date or provided reference date
 */
export function getNextHighImpactEvent(referenceDate: Date = new Date()): EconomicEvent | null {
  const refKey = formatDateKey(referenceDate);

  // Filter high impact events on or after referenceDate
  const upcoming = MASTER_ECONOMIC_EVENTS.filter(
    (e) => e.impact === 'high' && e.date >= refKey
  ).sort((a, b) => a.date.localeCompare(b.date));

  if (upcoming.length > 0) {
    return upcoming[0];
  }

  // If none strictly after, return the prominent default ECB/CPI event
  return (
    MASTER_ECONOMIC_EVENTS.find((e) => e.id === 'evt-2026-09-10-ecb') ||
    MASTER_ECONOMIC_EVENTS[0] ||
    null
  );
}
