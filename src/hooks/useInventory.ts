/**
 * hooks/useInventory.ts
 *
 * Two arrays are maintained:
 *
 *  allItems  — every item ever fetched/added, never truncated by pagination.
 *              Used by Dashboard and Inventory KPI cards for accurate stats.
 *
 *  items     — the current paginated/searched slice shown in the table.
 *
 * This is the single source of truth. Both Dashboard and Inventory read from
 * the same InventoryContext instance (mounted once in AppLayout), so any
 * mutation (addItem / updateItem) is immediately reflected everywhere.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { InventoryService } from '../services/inventory.service';
import type { InventoryItem } from '../types';
import { notify } from '../lib/toast';

export function useInventory() {
  // Paginated slice — what the table renders
  const [items,    setItems]    = useState<InventoryItem[]>([]);
  // Full untruncated list — what stats are derived from
  const [allItems, setAllItems] = useState<InventoryItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [total,   setTotal]   = useState(0);
  const [pages,   setPages]   = useState(1);
  const [page,    setPage]    = useState(1);
  const [search,  setSearch]  = useState('');

  const initialised     = useRef(false);
  const mounted         = useRef(false);
  const isFirstSearchRun = useRef(true);

  // ── Core fetch ────────────────────────────────────────────────────────────
  const fetchItems = useCallback(async () => {
    if (!initialised.current) setLoading(true);
    setError(null);
    try {
      // Fetch the current paginated/searched slice for the table
      const data = await InventoryService.getItems(search || undefined, page);
      setItems(data.items);
      setTotal(data.total);
      setPages(data.pages);

      // On the initial load (no search, page 1), also fetch ALL items so
      // stats are accurate from the start. On subsequent search/page changes
      // we keep allItems as-is — mutations keep it up to date locally.
      if (!initialised.current) {
        const all = await InventoryService.getItems(undefined, 1, data.total || 100);
        setAllItems(all.items);
      }

      initialised.current = true;
    } catch (e: any) {
      const msg = e.response?.data?.message || 'Failed to load inventory. Please try again.';
      setError(msg);
      notify.loadError(msg);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  // ── Initial load — once on mount ─────────────────────────────────────────
  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    fetchItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Search / page changes — skip first run ────────────────────────────────
  useEffect(() => {
    if (isFirstSearchRun.current) {
      isFirstSearchRun.current = false;
      return;
    }
    fetchItems();
  }, [fetchItems]);

  // ── Local mutators — update both slices without a refetch ─────────────────

  const addItem = useCallback((item: InventoryItem) => {
    setItems((prev) => [item, ...prev]);
    setAllItems((prev) => [item, ...prev]);   // keeps stats in sync
    setTotal((t) => t + 1);
  }, []);

  const updateItem = useCallback((updated: InventoryItem) => {
    const replace = (prev: InventoryItem[]) =>
      prev.map((i) => (i.id === updated.id ? updated : i));
    setItems(replace);
    setAllItems(replace);                     // keeps stats in sync
  }, []);

  return {
    items, allItems, loading, error, total, pages, page, search,
    setPage, setSearch, fetchItems, updateItem, addItem,
  };
}
