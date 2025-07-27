import { create } from 'zustand';
import type { User, CatInfo, CatConfig } from '../types';

interface AppState {
  user: User | null;
  currentCat: CatInfo | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setCurrentCat: (cat: CatInfo | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  currentCat: null,
  isLoading: false,
  error: null,
  
  setUser: (user) => set({ user }),
  setCurrentCat: (cat) => set({ currentCat: cat }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
})); 