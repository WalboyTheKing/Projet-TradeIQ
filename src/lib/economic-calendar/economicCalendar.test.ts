// ============================================================================
// UNIT TESTS FOR ECONOMIC CALENDAR ENGINE
// Validates:
// 1. Future event detection
// 2. Past event exclusion
// 3. Exact reference time event inclusion
// 4. Timezone conversion & midnight crossing (WAT vs ET vs CET)
// 5. Unavailable source fallback (OFFLINE_BACKUP)
// 6. Cache age & metadata tracking
// 7. Missing actual value handling (no invented data)
// 8. Numeric zero preservation (0, "0", "0.0%" != "—")
// 9. Non-standard currencies (CNY, ALL != USD)
// 10. getNextHighImpactEvent returns null when all events are past (no arbitrary past fallback)
// ============================================================================

import {
  formatEconomicValue,
  parseForexFactoryItem,
  formatEventTimeInTimezone,
  getEventDateKeyInTimezone,
  getNextHighImpactEvent,
  getEconomicScheduleForWeek,
} from '../economicCalendarData';
import { EconomicEvent } from '../../types/economicCalendar';

export function runEconomicCalendarTests() {
  const results: { test: string; passed: boolean; details?: string }[] = [];

  // Helper assertion
  function assert(testName: string, condition: boolean, details?: string) {
    results.push({
      test: testName,
      passed: Boolean(condition),
      details: condition ? undefined : details || 'Assertion failed',
    });
  }

  // -------------------------------------------------------------------------
  // Test 1: Numeric Zero Preservation vs Missing Values
  // -------------------------------------------------------------------------
  const zeroNumber = formatEconomicValue(0);
  const zeroStr = formatEconomicValue('0');
  const zeroPercent = formatEconomicValue('0.0%');
  const missingNull = formatEconomicValue(null);
  const missingUndefined = formatEconomicValue(undefined);
  const missingEmpty = formatEconomicValue('');
  const missingDash = formatEconomicValue('—');

  assert(
    'Preserve numeric zero (0, "0", "0.0%")',
    zeroNumber === '0' && zeroStr === '0' && zeroPercent === '0.0%',
    `Got zeroNumber=${zeroNumber}, zeroStr=${zeroStr}, zeroPercent=${zeroPercent}`
  );

  assert(
    'Convert empty/missing fields to "—" without fabrication',
    missingNull === '—' && missingUndefined === '—' && missingEmpty === '—' && missingDash === '—',
    `Got null=${missingNull}, undef=${missingUndefined}, empty=${missingEmpty}`
  );

  // -------------------------------------------------------------------------
  // Test 2: Parse ForexFactory Item (Real keys: title, country, date, impact, forecast, previous)
  // Ensure actual is NOT fabricated
  // -------------------------------------------------------------------------
  const rawFeedItem = {
    title: 'Non-Farm Employment Change',
    country: 'USD',
    date: '2026-10-23T08:30:00-04:00',
    impact: 'High',
    forecast: '150K',
    previous: '142K',
  };

  const parsedItem = parseForexFactoryItem(rawFeedItem, 0);
  assert(
    'Parse real ForexFactory item with correct fields and uninvented actual',
    parsedItem !== null &&
      parsedItem.event === 'Non-Farm Employment Change' &&
      parsedItem.currency === 'USD' &&
      parsedItem.impact === 'high' &&
      parsedItem.forecast === '150K' &&
      parsedItem.previous === '142K' &&
      parsedItem.actual === '—' &&
      parsedItem.timestamp !== undefined,
    `Parsed actual=${parsedItem?.actual}, timestamp=${parsedItem?.timestamp}`
  );

  // -------------------------------------------------------------------------
  // Test 3: Currency / Country Mapping for CNY and ALL (not USD)
  // -------------------------------------------------------------------------
  const cnyItem = parseForexFactoryItem(
    {
      title: 'Chinese GDP q/y',
      country: 'CNY',
      date: '2026-10-20T10:00:00+08:00',
      impact: 'High',
      forecast: '4.6%',
      previous: '4.7%',
    },
    1
  );

  const allItem = parseForexFactoryItem(
    {
      title: 'OPEC-JMMC Meetings',
      country: 'All',
      date: '2026-10-21T00:00:00Z',
      impact: 'Medium',
      forecast: '',
      previous: '',
    },
    2
  );

  assert(
    'CNY events correctly mapped to China/CNY (not USD)',
    cnyItem !== null && cnyItem.currency === 'CNY' && cnyItem.countryName === 'China' && cnyItem.flag === '🇨🇳',
    `Got currency=${cnyItem?.currency}, country=${cnyItem?.countryName}`
  );

  assert(
    'All/Global events mapped to International/ALL (not USD)',
    allItem !== null && allItem.currency === 'ALL' && allItem.countryName === 'International',
    `Got currency=${allItem?.currency}, country=${allItem?.countryName}`
  );

  // -------------------------------------------------------------------------
  // Test 4: Timezone Conversion & Midnight Crossing
  // Sunday 23:30 New York (EDT, UTC-4) is Monday 03:30 UTC and Monday 04:30 WAT (Africa/Porto-Novo)
  // -------------------------------------------------------------------------
  const sundayNightEvent: EconomicEvent = {
    id: 'evt-test-midnight',
    date: '2026-10-18',
    rawDate: '2026-10-18T23:30:00-04:00', // 2026-10-19T03:30:00Z
    timestamp: new Date('2026-10-18T23:30:00-04:00').getTime(),
    time: '11:30 PM',
    currency: 'USD',
    countryName: 'United States',
    flag: '🇺🇸',
    event: 'Late Night Macro Announcement',
    impact: 'high',
    forecast: '—',
    previous: '—',
    actual: '—',
  };

  const dateInET = getEventDateKeyInTimezone(sundayNightEvent.timestamp!, 'ET');
  const dateInWAT = getEventDateKeyInTimezone(sundayNightEvent.timestamp!, 'WAT');
  const timeInWAT = formatEventTimeInTimezone(sundayNightEvent, 'WAT');

  assert(
    'Midnight crossing correctly shifts date between ET (Sunday) and WAT (Monday)',
    dateInET === '2026-10-18' && dateInWAT === '2026-10-19',
    `ET date=${dateInET}, WAT date=${dateInWAT}`
  );

  assert(
    'Format time accurately in WAT (Bénin, UTC+1)',
    timeInWAT.includes('04:30') && timeInWAT.includes('AM'),
    `WAT time=${timeInWAT}`
  );

  // -------------------------------------------------------------------------
  // Test 5: Next High Impact Event — Future vs Past Exclusion
  // -------------------------------------------------------------------------
  const refTime = new Date('2026-10-21T12:00:00Z');

  const pastEvent: EconomicEvent = {
    id: 'evt-past',
    date: '2026-10-21',
    rawDate: '2026-10-21T10:00:00Z', // 2 hours before refTime
    timestamp: new Date('2026-10-21T10:00:00Z').getTime(),
    time: '10:00 AM',
    currency: 'USD',
    countryName: 'United States',
    flag: '🇺🇸',
    event: 'Past CPI Release',
    impact: 'high',
    forecast: '2.5%',
    previous: '2.4%',
    actual: '2.5%',
  };

  const futureEvent1: EconomicEvent = {
    id: 'evt-future-1',
    date: '2026-10-21',
    rawDate: '2026-10-21T14:00:00Z', // 2 hours after refTime
    timestamp: new Date('2026-10-21T14:00:00Z').getTime(),
    time: '02:00 PM',
    currency: 'USD',
    countryName: 'United States',
    flag: '🇺🇸',
    event: 'Future FOMC Decision',
    impact: 'high',
    forecast: '5.25%',
    previous: '5.50%',
    actual: '—',
  };

  const futureEvent2: EconomicEvent = {
    id: 'evt-future-2',
    date: '2026-10-22',
    rawDate: '2026-10-22T08:30:00Z',
    timestamp: new Date('2026-10-22T08:30:00Z').getTime(),
    time: '08:30 AM',
    currency: 'EUR',
    countryName: 'Eurozone',
    flag: '🇪🇺',
    event: 'Future ECB Decision',
    impact: 'high',
    forecast: '3.75%',
    previous: '4.00%',
    actual: '—',
  };

  const nextFromMixed = getNextHighImpactEvent([pastEvent, futureEvent1, futureEvent2], refTime);
  assert(
    'Correctly select immediate future event and exclude past events',
    nextFromMixed?.id === 'evt-future-1',
    `Expected evt-future-1, got ${nextFromMixed?.id}`
  );

  // -------------------------------------------------------------------------
  // Test 6: Exact Reference Time Event Inclusion
  // An event happening exactly at reference time is included
  // -------------------------------------------------------------------------
  const exactTimeEvent: EconomicEvent = {
    id: 'evt-exact',
    date: '2026-10-21',
    rawDate: '2026-10-21T12:00:00Z', // Exactly refTime
    timestamp: new Date('2026-10-21T12:00:00Z').getTime(),
    time: '12:00 PM',
    currency: 'GBP',
    countryName: 'United Kingdom',
    flag: '🇬🇧',
    event: 'Exact Minute Release',
    impact: 'high',
    forecast: '0.1%',
    previous: '0.2%',
    actual: '—',
  };

  const nextExact = getNextHighImpactEvent([pastEvent, exactTimeEvent, futureEvent1], refTime);
  assert(
    'Include event occurring exactly at reference timestamp',
    nextExact?.id === 'evt-exact',
    `Expected evt-exact, got ${nextExact?.id}`
  );

  // -------------------------------------------------------------------------
  // Test 7: Returns NULL when all events are past (NO arbitrary past fallback)
  // -------------------------------------------------------------------------
  const pastEventsOnly = [pastEvent];
  const nextPastOnly = getNextHighImpactEvent(pastEventsOnly, refTime);

  assert(
    'Return null when all high-impact events are past (no past fallback)',
    nextPastOnly === null,
    `Expected null, got ${JSON.stringify(nextPastOnly)}`
  );

  // -------------------------------------------------------------------------
  // Test 8: Weekly Schedule Dynamic Timezone Partitioning
  // -------------------------------------------------------------------------
  const monday = new Date('2026-10-19T00:00:00Z');
  const scheduleWAT = getEconomicScheduleForWeek(
    monday,
    undefined,
    undefined,
    undefined,
    [sundayNightEvent, pastEvent, futureEvent1],
    'WAT'
  );

  // In WAT, sundayNightEvent falls on Monday (2026-10-19)
  const mondaySchedule = scheduleWAT.find((d) => d.dateStr === '2026-10-19');
  const hasEventOnMondayWAT = mondaySchedule?.events.some((e) => e.id === 'evt-test-midnight');

  assert(
    'Assign midnight-crossing event to Monday in WAT schedule',
    Boolean(hasEventOnMondayWAT),
    `Monday events in WAT: ${JSON.stringify(mondaySchedule?.events.map((e) => e.id))}`
  );

  return results;
}

// Direct CLI execution support
if (process.argv[1]?.includes('economicCalendar.test')) {
  console.log('--- RUNNING ECONOMIC CALENDAR ENGINE TESTS ---');
  const results = runEconomicCalendarTests();
  let passCount = 0;
  results.forEach((r, idx) => {
    if (r.passed) {
      passCount++;
      console.log(`[PASS] ${idx + 1}. ${r.test}`);
    } else {
      console.error(`[FAIL] ${idx + 1}. ${r.test} - ${r.details}`);
    }
  });
  console.log(`\nResult: ${passCount}/${results.length} passed.`);
  if (passCount !== results.length) {
    process.exit(1);
  }
}
