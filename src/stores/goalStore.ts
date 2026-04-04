import { create } from 'zustand';
import { getDatabase } from '../db/database';
import * as queries from '../db/queries';
import type { Goal, GoalInput } from '../types';

interface GoalState {
  goals: Goal[];
  isLoading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  upsert: (input: GoalInput) => Promise<void>;
  remove: (id: number) => Promise<void>;
  deleteGoal: (month: string) => Promise<void>;
}

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  isLoading: false,
  error: null,
  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const db = getDatabase();
      const goals = await queries.getAllGoals(db);
      set({ goals, isLoading: false });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load goals';
      set({ error: message, isLoading: false });
    }
  },
  upsert: async (input: GoalInput) => {
    set({ isLoading: true, error: null });
    try {
      const db = getDatabase();
      await queries.upsertGoalForMonth(db, input);
      await get().fetchAll();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to save goal';
      set({ error: message, isLoading: false });
    }
  },
  remove: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const db = getDatabase();
      await queries.deleteGoal(db, id);
      await get().fetchAll();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to delete goal';
      set({ error: message, isLoading: false });
    }
  },
  deleteGoal: async (month: string) => {
    set({ isLoading: true, error: null });
    try {
      const db = getDatabase();
      await queries.deleteGoalByMonth(db, month);
      await get().fetchAll();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to delete goal';
      set({ error: message, isLoading: false });
    }
  },
}));
