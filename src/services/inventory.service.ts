/**
 * services/inventory.service.ts
 *
 * Handles all inventory-related API calls.
 * Abstracts axios usage and returns clean, typed data.
 */

import { inventoryApi } from '../api/inventory';
import type { InventoryItem } from '../types';

export interface ItemsResult {
  items: InventoryItem[];
  total: number;
  pages: number;
}

export const InventoryService = {
  /**
   * Fetch a paginated, optionally filtered list of inventory items.
   */
  getItems: (search?: string, page = 1, limit = 10): Promise<ItemsResult> =>
    inventoryApi.getItems(search, page, limit).then((r) => r.data as ItemsResult),

  /**
   * Create a new inventory item (ADMIN only).
   */
  createItem: (name: string, quantity: number): Promise<InventoryItem> =>
    inventoryApi.createItem(name, quantity).then((r) => r.data as InventoryItem),

  /**
   * Add stock units to an existing item (ADMIN only).
   */
  stockIn: (id: string, quantity: number): Promise<InventoryItem> =>
    inventoryApi.stockIn(id, quantity).then((r) => r.data as InventoryItem),

  /**
   * Remove stock units from an existing item (ADMIN only).
   */
  stockOut: (id: string, quantity: number): Promise<InventoryItem> =>
    inventoryApi.stockOut(id, quantity).then((r) => r.data as InventoryItem),
};
