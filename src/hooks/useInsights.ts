import { endOfWeek, format, startOfWeek, subWeeks } from 'date-fns';
import { useMemo } from 'react';
import { useGoalStore } from '../stores/goalStore';
import { useTransactionStore } from '../stores/transactionStore';
import type { Category, MonthlySummary, Transaction } from '../types';
import { CATEGORIES } from '../utils/categories';
import { formatCurrency } from '../utils/formatCurrency';
import { useGoals } from './useGoals';

function categoryById(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

function sumExpensesBetweenInclusive(
  all: Transaction[],
  startYmd: string,
  endYmd: string,
): number {
  let sum = 0;
  for (const t of all) {
    if (t.type !== 'expense') {
      continue;
    }
    if (t.date >= startYmd && t.date <= endYmd) {
      sum += t.amount;
    }
  }
  return sum;
}

export function useInsights() {
  const transactions = useTransactionStore((s) => s.transactions);
  const goals = useGoalStore((s) => s.goals);
  const { currentMonthGoal, goalProgress } = useGoals();

  const topSpendingCategory = (
    month: string,
  ): { category: Category; total: number; percentage: number } | null => {
    const map = new Map<string, number>();
    let totalExp = 0;
    for (const t of transactions) {
      if (t.type !== 'expense' || !t.date.startsWith(month)) {
        continue;
      }
      totalExp += t.amount;
      map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    }
    if (totalExp <= 0) {
      return null;
    }
    let topId = '';
    let topVal = 0;
    for (const [id, val] of map) {
      if (val > topVal) {
        topVal = val;
        topId = id;
      }
    }
    const cat = categoryById(topId);
    if (!cat) {
      return null;
    }
    return {
      category: cat,
      total: topVal,
      percentage: (topVal / totalExp) * 100,
    };
  };

  const weeklyComparison = (): {
    thisWeek: number;
    lastWeek: number;
    changePercent: number;
    direction: 'up' | 'down' | 'same';
  } => {
    const now = new Date();
    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const thisStartStr = format(thisWeekStart, 'yyyy-MM-dd');
    const thisEndStr = format(now, 'yyyy-MM-dd');

    const prevWeekMid = subWeeks(now, 1);
    const lastWeekStart = startOfWeek(prevWeekMid, { weekStartsOn: 1 });
    const lastWeekEnd = endOfWeek(prevWeekMid, { weekStartsOn: 1 });
    const lastStartStr = format(lastWeekStart, 'yyyy-MM-dd');
    const lastEndStr = format(lastWeekEnd, 'yyyy-MM-dd');

    const thisWeek = sumExpensesBetweenInclusive(transactions, thisStartStr, thisEndStr);
    const lastWeek = sumExpensesBetweenInclusive(transactions, lastStartStr, lastEndStr);

    let changePercent = 0;
    if (lastWeek === 0) {
      changePercent = thisWeek === 0 ? 0 : 100;
    } else {
      changePercent = Math.abs(((thisWeek - lastWeek) / lastWeek) * 100);
    }
    let direction: 'up' | 'down' | 'same' = 'same';
    if (thisWeek > lastWeek) {
      direction = 'up';
    } else if (thisWeek < lastWeek) {
      direction = 'down';
    }
    return { thisWeek, lastWeek, changePercent, direction };
  };

  const monthlyTrend = (months: number): MonthlySummary[] => {
    const out: MonthlySummary[] = [];
    const anchor = new Date();
    for (let i = months - 1; i >= 0; i -= 1) {
      const ref = new Date(anchor.getFullYear(), anchor.getMonth() - i, 1);
      const key = format(ref, 'yyyy-MM');
      let income = 0;
      let expenses = 0;
      for (const t of transactions) {
        if (!t.date.startsWith(key)) {
          continue;
        }
        if (t.type === 'income') {
          income += t.amount;
        } else {
          expenses += t.amount;
        }
      }
      out.push({
        month: key,
        income,
        expenses,
        savings: income - expenses,
      });
    }
    return out;
  };

  const categoryBreakdown = (
    month: string,
  ): { category: Category; total: number; percentage: number }[] => {
    const map = new Map<string, number>();
    let totalExp = 0;
    for (const t of transactions) {
      if (t.type !== 'expense' || !t.date.startsWith(month)) {
        continue;
      }
      totalExp += t.amount;
      map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    }
    if (totalExp <= 0) {
      return [];
    }
    const rows = Array.from(map.entries())
      .map(([id, total]) => {
        const cat = categoryById(id);
        return {
          category: cat,
          total,
          percentage: (total / totalExp) * 100,
        };
      })
      .filter((r): r is { category: Category; total: number; percentage: number } => !!r.category)
      .sort((a, b) => b.total - a.total);

    const top = rows.slice(0, 6);
    const rest = rows.slice(6);
    if (rest.length === 0) {
      return top;
    }
    const otherTotal = rest.reduce((s, r) => s + r.total, 0);
    const otherCat = CATEGORIES.find((c) => c.id === 'other');
    if (!otherCat) {
      return top;
    }
    return [
      ...top,
      {
        category: otherCat,
        total: otherTotal,
        percentage: (otherTotal / totalExp) * 100,
      },
    ];
  };

  const insightSentences = (month: string): string[] => {
    const sentences: string[] = [];
    const top = topSpendingCategory(month);
    if (top) {
      sentences.push(
        `Your biggest expense is ${top.category.label} at ${formatCurrency(top.total)} this month`,
      );
    }
    const w = weeklyComparison();
    if (w.direction !== 'same' || w.thisWeek > 0 || w.lastWeek > 0) {
      const pct = Math.round(w.changePercent);
      if (w.direction === 'up') {
        sentences.push(`You spent ${pct}% more than last week`);
      } else if (w.direction === 'down') {
        sentences.push(`You spent ${pct}% less than last week`);
      }
    }
    const g = currentMonthGoal(goals);
    if (g) {
      const p = goalProgress(g);
      sentences.push(
        `You're saving ${formatCurrency(Math.max(0, p.current))} of your ${formatCurrency(g.target)} goal so far`,
      );
    }
    return sentences.slice(0, 3);
  };

  return useMemo(
    () => ({
      topSpendingCategory,
      weeklyComparison,
      monthlyTrend,
      categoryBreakdown,
      insightSentences,
    }),
    [transactions, goals],
  );
}
