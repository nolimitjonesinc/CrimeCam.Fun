'use client';
import { create } from 'zustand';

export type HistoryItem = { id: string; createdAt: number; thumbnail: string; text: string };

type Store = {
  items: HistoryItem[];
  addItem: (h: HistoryItem) => void;
  clear: () => void;
};

const key = 'crimecam-history-v1';

const initial: HistoryItem[] = (() => {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
})();

export const useHistory = create<Store>((set, get) => ({
  items: initial,
  addItem: (h) => set(() => {
    const arr = [h, ...get().items].slice(0, 10);
    if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(arr));
    return { items: arr };
  }),
  clear: () => set(() => { if (typeof window !== 'undefined') localStorage.removeItem(key); return { items: [] }; })
}));