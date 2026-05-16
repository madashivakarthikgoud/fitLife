/**
 * Lightweight statistical utilities for client-side AI insights.
 * Zero dependencies — pure math functions.
 */

export interface RegressionResult {
  slope: number;
  intercept: number;
  r2: number;
}

export interface DayOfWeekAvg {
  day: number;       // 0=Sun, 6=Sat
  dayName: string;
  avg: number;
  count: number;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Simple moving average over a window */
export function movingAverage(data: number[], window: number): number[] {
  if (data.length === 0 || window <= 0) return [];
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = data.slice(start, i + 1);
    result.push(slice.reduce((a, b) => a + b, 0) / slice.length);
  }
  return result;
}

/** Arithmetic mean */
export function mean(data: number[]): number {
  if (data.length === 0) return 0;
  return data.reduce((a, b) => a + b, 0) / data.length;
}

/** Standard deviation */
export function standardDeviation(data: number[]): number {
  if (data.length < 2) return 0;
  const m = mean(data);
  const variance = data.reduce((sum, v) => sum + (v - m) ** 2, 0) / data.length;
  return Math.sqrt(variance);
}

/** Z-score: how many standard deviations a value is from the mean */
export function zScore(value: number, dataMean: number, dataStdDev: number): number {
  if (dataStdDev === 0) return 0;
  return (value - dataMean) / dataStdDev;
}

/** Simple linear regression: y = slope * x + intercept */
export function linearRegression(points: { x: number; y: number }[]): RegressionResult {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: 0, r2: 0 };

  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);
  const sumY2 = points.reduce((s, p) => s + p.y * p.y, 0);

  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return { slope: 0, intercept: sumY / n, r2: 0 };

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  // R² (coefficient of determination)
  const yMean = sumY / n;
  const ssTot = sumY2 - n * yMean * yMean;
  const ssRes = points.reduce((s, p) => s + (p.y - (slope * p.x + intercept)) ** 2, 0);
  const r2 = ssTot === 0 ? 0 : Math.max(0, 1 - ssRes / ssTot);

  return { slope, intercept, r2 };
}

/** Group dated numeric values by day of week and compute averages */
export function groupByDayOfWeek(items: { date: string; value: number }[]): DayOfWeekAvg[] {
  const groups: { total: number; count: number }[] = Array.from({ length: 7 }, () => ({ total: 0, count: 0 }));

  for (const item of items) {
    const day = new Date(item.date).getDay();
    groups[day].total += item.value;
    groups[day].count++;
  }

  return groups.map((g, i) => ({
    day: i,
    dayName: DAY_NAMES[i],
    avg: g.count > 0 ? Math.round(g.total / g.count) : 0,
    count: g.count
  }));
}

/** Get date string (YYYY-MM-DD) for N days ago */
export function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

/** Group items by date and sum a numeric field */
export function sumByDate(items: { date: string; value: number }[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const item of items) {
    const dateKey = item.date.split('T')[0];
    map.set(dateKey, (map.get(dateKey) || 0) + item.value);
  }
  return map;
}

/** Percentage change between two values */
export function pctChange(oldVal: number, newVal: number): number {
  if (oldVal === 0) return 0;
  return Math.round(((newVal - oldVal) / oldVal) * 100);
}

