/*
  Calculation helpers for states and habit frequency
*/
type LogEntry = {
  type: string; // 'state' | 'habit' | other
  state?: string;
  habitId?: string;
  success?: boolean;
  loggedAt?: string | Date;
  [key: string]: any;
};

function toDate(d?: string | Date): Date | null {
  if (!d) return null;
  return d instanceof Date ? d : new Date(d);
}

export function computeStateStats(logs: LogEntry[], options?: {startDate?: string | Date; endDate?: string | Date}) {
  const start = toDate(options?.startDate) || null;
  const end = toDate(options?.endDate) || null;

  const stateCounts: Record<string, number> = {};
  let total = 0;
  let earliest: Date | null = null;
  let latest: Date | null = null;

  for (const entry of logs || []) {
    if (entry.type !== "state" || !entry.state) continue;
    const d = toDate(entry.loggedAt) || null;
    if (start && d && d < start) continue;
    if (end && d && d > end) continue;

    if (d) {
      if (!earliest || d < earliest) earliest = d;
      if (!latest || d > latest) latest = d;
    }

    stateCounts[entry.state] = (stateCounts[entry.state] || 0) + 1;
    total++;
  }

  const rangeDays = (() => {
    if (start && end) return Math.max(1, Math.ceil(((end as Date).getTime() - (start as Date).getTime()) / (1000 * 60 * 60 * 24)));
    if (earliest && latest) return Math.max(1, Math.ceil((latest.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24)) || 1);
    return 1;
  })();

  const byState: Record<string, {count: number; percentage: number; perDayAverage: number}> = {};
  Object.keys(stateCounts).forEach((s) => {
    const count = stateCounts[s];
    byState[s] = {
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
      perDayAverage: count / rangeDays
    };
  });

  return {
    totalEntries: total,
    rangeDays,
    byState
  };
}

export function computeHabitFrequency(logs: LogEntry[], options?: {startDate?: string | Date; endDate?: string | Date; bucket?: 'daily' | 'weekly'}) {
  const start = toDate(options?.startDate) || null;
  const end = toDate(options?.endDate) || null;
  const bucket = options?.bucket || 'weekly';

  const habits: Record<string, {count: number; successes: number}> = {};
  let earliest: Date | null = null;
  let latest: Date | null = null;

  for (const entry of logs || []) {
    if (entry.type !== 'habit' || !entry.habitId) continue;
    const d = toDate(entry.loggedAt) || null;
    if (start && d && d < start) continue;
    if (end && d && d > end) continue;

    if (d) {
      if (!earliest || d < earliest) earliest = d;
      if (!latest || d > latest) latest = d;
    }

    const id = entry.habitId;
    if (!habits[id]) habits[id] = {count: 0, successes: 0};
    habits[id].count++;
    if (entry.success) habits[id].successes++;
  }

  const rangeDays = (() => {
    if (start && end) return Math.max(1, Math.ceil(((end as Date).getTime() - (start as Date).getTime()) / (1000 * 60 * 60 * 24)));
    if (earliest && latest) return Math.max(1, Math.ceil((latest.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24)) || 1);
    return 1;
  })();

  const multiplier = bucket === 'weekly' ? 7 : 1;

  const result = Object.keys(habits).map((id) => {
    const data = habits[id];
    return {
      habitId: id,
      total: data.count,
      successRate: data.count > 0 ? data.successes / data.count : 0,
      occurrencesPerBucket: data.count / (rangeDays / multiplier)
    };
  });

  return {
    rangeDays,
    bucket,
    habits: result
  };
}

export default {computeStateStats, computeHabitFrequency};
