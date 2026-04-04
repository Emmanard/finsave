export interface Transaction {
  id: number;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  notes: string;
  created_at: string;
}

export type TransactionInput = Omit<Transaction, 'id' | 'created_at'>;

export interface Goal {
  id: number;
  title: string;
  target: number;
  month: string;
  created_at: string;
}

export type GoalInput = Omit<Goal, 'id' | 'created_at'>;

export type GoalStatus =
  | 'on-track'
  | 'at-risk'
  | 'achieved'
  | 'over-budget'
  | 'no-data';

export interface Category {
  id: string;
  label: string;
  icon: string;
  color: string;
  type: 'income' | 'expense' | 'both';
}

export interface MonthlySummary {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

export interface GoalProgress {
  current: number;
  percentage: number;
  status: GoalStatus;
  message: string;
}

export interface ProfileState {
  displayName: string;
  isLoading: boolean;
  load: () => Promise<void>;
  save: (name: string) => Promise<void>;
}
