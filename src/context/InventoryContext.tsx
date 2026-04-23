import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useInventory } from '../hooks/useInventory';
import type { InventoryItem } from '../types';

interface InventoryContextType {
  items: InventoryItem[];
  allItems: InventoryItem[];       // full untruncated list for stats
  loading: boolean;
  error: string | null;
  total: number;
  pages: number;
  page: number;
  search: string;
  setPage: (p: number | ((prev: number) => number)) => void;
  setSearch: (s: string) => void;
  fetchItems: () => void;
  updateItem: (item: InventoryItem) => void;
  addItem: (item: InventoryItem) => void;
}

const InventoryContext = createContext<InventoryContextType | null>(null);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const inventory = useInventory();
  return (
    <InventoryContext.Provider value={inventory}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventoryContext() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventoryContext must be used within InventoryProvider');
  return ctx;
}
