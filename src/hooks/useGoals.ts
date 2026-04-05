import { format, getDate, subMonths } from 'date-fns';
import { useMemo } from 'react';
import { useTransactionStore } from '../stores/transactionStore';
import type { Goal, GoalProgress, Transaction } from '../types';

const MSGS: Record<GoalProgress['status'], string> = {
  'no-data': 'Add transactions to track your progress',
  'over-budget': 'Time to cut back — expenses are over income',
  achieved: 'You crushed it! Goal complete 🎉',
  'on-track': 'Great pace — keep it up!',
  'at-risk': 'You can still make it — watch your spending',
};

function computeGoalProgress(goal: Goal, all: Transaction[]): GoalProgress {
  const month = goal.month;
  const monthTxs = all.filter((t) => t.date.startsWith(month));
  const hasMonthData = monthTxs.length > 0;

  let income = 0;
  let expenses = 0;
  for (const t of monthTxs) {
    if (t.type === 'income') {
      income += t.amount;
    } else {
      expenses += t.amount;
    }
  }

  const savings = income - expenses;
  const target = goal.target;
  const percentage = Math.min(
    100,
    Math.max(0, target > 0 ? (savings / target) * 100 : 0),
  );

  if (!hasMonthData) {
    return {
      current: savings,
      percentage,
      status: 'no-data',
      message: MSGS['no-data'],
    };
  }
  if (expenses > income) {
    return {
      current: savings,
      percentage,
      status: 'over-budget',
      message: MSGS['over-budget'],
    };
  }
  if (savings >= target) {
    return {
      current: savings,
      percentage,
      status: 'achieved',
      message: MSGS.achieved,
    };
  }
  if (savings >= target * 0.6) {
    return {
      current: savings,
      percentage,
      status: 'on-track',
      message: MSGS['on-track'],
    };
  }
  if (getDate(new Date()) > 15) {
    return {
      current: savings,
      percentage,
      status: 'at-risk',
      message: MSGS['at-risk'],
    };
  }
  return {
    current: savings,
    percentage,
    status: 'on-track',
    message: MSGS['on-track'],
  };
}

/** Consecutive months (from current backward) where this month's goal was actually achieved (savings ≥ target). */
function streakCountFn(goals: Goal[], all: Transaction[]): number {
  const now = new Date();
  let streak = 0;
  let cursor = now;
  for (;;) {
    const key = format(cursor, 'yyyy-MM');
    const goalForMonth = goals.find((g) => g.month === key);
    if (!goalForMonth) break;
    const progress = computeGoalProgress(goalForMonth, all);
    if (progress.status !== 'achieved') break;
    streak += 1;
    cursor = subMonths(cursor, 1);
  }
  return streak;
}

export function useGoals() {
  const transactions = useTransactionStore((s) => s.transactions);

  return useMemo(() => {
    const currentMonthGoal = (goals: Goal[]): Goal | null => {
      const key = format(new Date(), 'yyyy-MM');
      return goals.find((g) => g.month === key) ?? null;
    };

    const goalProgress = (goal: Goal): GoalProgress => {
      return computeGoalProgress(goal, transactions);
    };

    const streakCount = (goals: Goal[]): number => {
      return streakCountFn(goals, transactions);
    };

    return {
      currentMonthGoal,
      goalProgress,
      streakCount,
    };
  }, [transactions]);
}
