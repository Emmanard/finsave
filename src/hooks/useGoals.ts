import { getDate } from 'date-fns';
import { useMemo } from 'react';
import { useTransactionStore } from '../stores/transactionStore';
import type { Goal, GoalProgress, Transaction } from '../types';

function currentMonthString(): string {
  const n = new Date();
  const y = n.getFullYear();
  const m = String(n.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function computeGoalProgress(goal: Goal, all: Transaction[]): GoalProgress {
  const month = goal.month;
  let income = 0;
  let expenses = 0;
  for (const t of all) {
    if (!t.date.startsWith(month)) {
      continue;
    }
    if (t.type === 'income') {
      income += t.amount;
    } else {
      expenses += t.amount;
    }
  }
  const savings = income - expenses;
  const target = goal.target;
  const percentage = target > 0 ? Math.min(100, (savings / target) * 100) : 0;
  const hasMonthData = all.some((t) => t.date.startsWith(month));

  if (!hasMonthData) {
    return {
      current: savings,
      percentage,
      status: 'no-data',
      message: 'Add transactions to track your progress',
    };
  }
  if (expenses > income) {
    return {
      current: savings,
      percentage,
      status: 'over-budget',
      message: 'Time to cut back — expenses are over income',
    };
  }
  if (savings >= target) {
    return {
      current: savings,
      percentage,
      status: 'achieved',
      message: 'You crushed it! Goal complete 🎉',
    };
  }
  if (savings >= target * 0.6) {
    return {
      current: savings,
      percentage,
      status: 'on-track',
      message: 'Great pace — keep it up!',
    };
  }

  const today = new Date();
  const day = getDate(today);
  const monthNow = currentMonthString();
  if (month === monthNow && day > 15) {
    return {
      current: savings,
      percentage,
      status: 'at-risk',
      message: 'You can still make it — watch your spending',
    };
  }

  return {
    current: savings,
    percentage,
    status: 'on-track',
    message: 'Great pace — keep it up!',
  };
}

export function useGoals() {
  const transactions = useTransactionStore((s) => s.transactions);

  const currentMonthGoal = (goals: Goal[]): Goal | null => {
    const key = currentMonthString();
    const match = goals.find((g) => g.month === key);
    return match ?? null;
  };

  const goalProgress = (goal: Goal): GoalProgress => {
    return computeGoalProgress(goal, transactions);
  };

  return useMemo(
    () => ({
      currentMonthGoal,
      goalProgress,
    }),
    [transactions],
  );
}
