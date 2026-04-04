import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { getDatabase } from '../db/database';
import * as queries from '../db/queries';
import type { GoalInput, TransactionInput } from '../types';

const SEED_KEY = 'finsave_seeded';

function ymd(year: number, month: number, day: number): string {
  return format(new Date(year, month - 1, day), 'yyyy-MM-dd');
}

export async function seedIfNeeded(): Promise<void> {
  const flagged = await AsyncStorage.getItem(SEED_KEY);
  if (flagged === 'true') {
    return;
  }

  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const monthStr = format(new Date(y, m - 1, 1), 'yyyy-MM');
  const db = getDatabase();

  const txs: TransactionInput[] = [
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

  for (const t of txs) {
    await queries.insertTransaction(db, t);
  }

  const goal: GoalInput = {
    title: 'Monthly Savings',
    target: 30000,
    month: monthStr,
  };
  await queries.insertGoal(db, goal);

  await AsyncStorage.setItem(SEED_KEY, 'true');
}
