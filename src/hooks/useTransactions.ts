import {
  format,
  isToday,
  isYesterday,
  parseISO,
  startOfDay,
} from 'date-fns';
import { useMemo } from 'react';
import { useTransactionStore } from '../stores/transactionStore';
import type { Transaction } from '../types';
import { CATEGORIES } from '../utils/categories';

function monthPrefix(month?: string): string | undefined {
  return month;
}

function transactionInMonth(date: string, month?: string): boolean {
  if (!month) {
    return true;
  }
  return date.startsWith(month);
}

function categoryLabelForId(id: string): string {
  const found = CATEGORIES.find((c) => c.id === id);
  return found ? found.label : id;
}

export function useTransactions() {
  const transactions = useTransactionStore((s) => s.transactions);

  const totalIncome = (month?: string): number => {
    const m = monthPrefix(month);
    return transactions
      .filter((t) => t.type === 'income' && transactionInMonth(t.date, m))
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const totalExpenses = (month?: string): number => {
    const m = monthPrefix(month);
    return transactions
      .filter((t) => t.type === 'expense' && transactionInMonth(t.date, m))
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const balance = (month?: string): number => {
    return totalIncome(month) - totalExpenses(month);
  };

  const byCategory = (
    type: 'expense' | 'income',
    month?: string,
  ): { category: string; total: number }[] => {
    const m = monthPrefix(month);
    const map = new Map<string, number>();
    for (const t of transactions) {
      if (t.type !== type || !transactionInMonth(t.date, m)) {
        continue;
      }
      const prev = map.get(t.category) ?? 0;
      map.set(t.category, prev + t.amount);
    }
    return Array.from(map.entries()).map(([category, total]) => ({ category, total }));
  };

  const recentFive = (): Transaction[] => {
    const sorted = [...transactions].sort((a, b) => {
      if (a.date === b.date) {
        return b.id - a.id;
      }
      return a.date < b.date ? 1 : -1;
    });
    return sorted.slice(0, 5);
  };

  const filtered = (
    type?: string,
    category?: string,
    search?: string,
  ): Transaction[] => {
    const q = search?.trim().toLowerCase() ?? '';
    return transactions.filter((t) => {
      if (type && type !== 'all' && t.type !== type) {
        return false;
      }
      if (category && t.category !== category) {
        return false;
      }
      if (!q) {
        return true;
      }
      const label = categoryLabelForId(t.category).toLowerCase();
      const amountStr = String(Math.round(t.amount));
      const notes = t.notes.toLowerCase();
      return (
        notes.includes(q) ||
        amountStr.includes(q) ||
        label.includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    });
  };

  const groupedByDate = (): { title: string; data: Transaction[] }[] => {
    const map = new Map<string, Transaction[]>();
    const sorted = [...transactions].sort((a, b) => {
      if (a.date === b.date) {
        return b.id - a.id;
      }
      return a.date < b.date ? 1 : -1;
    });
    for (const t of sorted) {
      const list = map.get(t.date) ?? [];
      list.push(t);
      map.set(t.date, list);
    }
    const groups: { title: string; data: Transaction[] }[] = [];
    for (const [dateStr, data] of map) {
      const d = startOfDay(parseISO(dateStr));
      let title: string;
      if (isToday(d)) {
        title = 'Today';
      } else if (isYesterday(d)) {
        title = 'Yesterday';
      } else {
        title = format(d, 'EEE, d MMM yyyy');
      }
      groups.push({ title, data });
    }
    return groups;
  };

  return useMemo(
    () => ({
      totalIncome,
      totalExpenses,
      balance,
      byCategory,
      recentFive,
      filtered,
      groupedByDate,
    }),
    [transactions],
  );
}
