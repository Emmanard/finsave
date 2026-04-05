import { format, subMonths } from 'date-fns';
import { getDatabase } from '../db/database';
import * as queries from '../db/queries';
import type { GoalInput, TransactionInput } from '../types';

function ymd(year: number, month: number, day: number): string {
  return format(new Date(year, month - 1, day), 'yyyy-MM-dd');
}

/** Current month plus the two prior calendar months (3 total). */
function lastThreeMonthContexts(): { y: number; m: number; monthStr: string }[] {
  const out: { y: number; m: number; monthStr: string }[] = [];
  for (let i = 0; i < 3; i++) {
    const d = subMonths(new Date(), i);
    out.push({
      y: d.getFullYear(),
      m: d.getMonth() + 1,
      monthStr: format(d, 'yyyy-MM'),
    });
  }
  return out;
}

export function buildDemoTransactions(y: number, m: number): TransactionInput[] {
  return [
    { amount: 85000, type: 'income', category: 'salary', date: ymd(y, m, 1), notes: '' },
    { amount: 18000, type: 'income', category: 'freelance', date: ymd(y, m, 5), notes: '' },
    { amount: 650, type: 'expense', category: 'food', date: ymd(y, m, 2), notes: '' },
    { amount: 1200, type: 'expense', category: 'food', date: ymd(y, m, 8), notes: '' },
    { amount: 890, type: 'expense', category: 'food', date: ymd(y, m, 14), notes: '' },
    { amount: 2100, type: 'expense', category: 'food', date: ymd(y, m, 20), notes: '' },
    { amount: 350, type: 'expense', category: 'transport', date: ymd(y, m, 3), notes: '' },
    { amount: 200, type: 'expense', category: 'transport', date: ymd(y, m, 11), notes: '' },
    { amount: 750, type: 'expense', category: 'transport', date: ymd(y, m, 18), notes: '' },
    { amount: 3200, type: 'expense', category: 'shopping', date: ymd(y, m, 6), notes: '' },
    { amount: 1800, type: 'expense', category: 'shopping', date: ymd(y, m, 16), notes: '' },
    { amount: 2800, type: 'expense', category: 'bills', date: ymd(y, m, 1), notes: '' },
    { amount: 1400, type: 'expense', category: 'bills', date: ymd(y, m, 15), notes: '' },
    { amount: 950, type: 'expense', category: 'health', date: ymd(y, m, 9), notes: '' },
    { amount: 999, type: 'expense', category: 'entertainment', date: ymd(y, m, 12), notes: '' },
  ];
}

export function buildDemoGoal(monthStr: string): GoalInput {
  return {
    title: 'Monthly Savings',
    target: 30000,
    month: monthStr,
  };
}

async function insertDemoPayload(
  db: Parameters<typeof queries.insertTransaction>[0],
): Promise<void> {
  const months = lastThreeMonthContexts();
  for (const { y, m } of months) {
    const txs = buildDemoTransactions(y, m);
    for (const t of txs) {
      await queries.insertTransaction(db, t);
    }
  }
  for (const { monthStr } of months) {
    await queries.upsertGoalForMonth(db, buildDemoGoal(monthStr));
  }
}

/**
 * Dev / reviewer helper: loads sample transactions across the last 3 months + a savings goal per month.
 * New installs start with an empty ledger; this is not run automatically.
 */
export async function restoreDemoData(): Promise<void> {
  const db = getDatabase();
  await queries.deleteAllTransactions(db);
  await insertDemoPayload(db);
}
