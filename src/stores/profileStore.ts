import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import type { ProfileState } from '../types';

const STORAGE_KEY = 'finsave_display_name';

export const useProfileStore = create<ProfileState>((set) => ({
  displayName: 'You',
  isLoading: true,
  load: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const name = stored && stored.trim().length > 0 ? stored.trim() : 'You';
      set({ displayName: name, isLoading: false });
    } catch {
      set({ displayName: 'You', isLoading: false });
    }
  },
  save: async (name: string) => {
    const trimmed = name.trim().length > 0 ? name.trim() : 'You';
    await AsyncStorage.setItem(STORAGE_KEY, trimmed);
    set({ displayName: trimmed });
  },
}));
