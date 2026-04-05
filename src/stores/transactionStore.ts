import { create } from 'zustand';
import { getDatabase } from '../db/database';
import * as queries from '../db/queries';
import type { Transaction, TransactionInput } from '../types';

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  add: (input: TransactionInput) => Promise<void>;
  addTransaction: (input: TransactionInput) => Promise<void>;
  update: (id: number, input: Partial<TransactionInput>) => Promise<void>;
  updateTransaction: (id: number, input: Partial<TransactionInput>) => Promise<void>;
  remove: (id: number) => Promise<void>;
  clearAll: () => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  isLoading: false,
  error: null,
  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const db = getDatabase();
      const transactions = await queries.getAllTransactions(db);
      set({ transactions, isLoading: false });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load transactions';
      set({ error: message, isLoading: false });
    }
  },
  add: async (input: TransactionInput) => {
    set({ isLoading: true, error: null });
    try {
      const db = getDatabase();
      await queries.insertTransaction(db, input);
      await get().fetchAll();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to add transaction';
      set({ error: message, isLoading: false });
    }
  },
  addTransaction: async (input: TransactionInput) => {
    await get().add(input);
  },
  update: async (id: number, input: Partial<TransactionInput>) => {
    set({ isLoading: true, error: null });
    try {
      const db = getDatabase();
      await queries.updateTransaction(db, id, input);
      await get().fetchAll();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update transaction';
      set({ error: message, isLoading: false });
    }
  },
  updateTransaction: async (id: number, input: Partial<TransactionInput>) => {
    await get().update(id, input);
  },
  remove: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const db = getDatabase();
      await queries.deleteTransaction(db, id);
      await get().fetchAll();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to delete transaction';
      set({ error: message, isLoading: false });
    }
  },
  clearAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const db = getDatabase();
      await queries.deleteAllTransactions(db);
      await get().fetchAll();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to clear transactions';
      set({ error: message, isLoading: false });
    }
  },
}));
