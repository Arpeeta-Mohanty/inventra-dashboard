import api from './axios';
import type { User, InventoryItem } from '../types';

export const authApi = {
  register: (email: string, password: string, role: string) =>
    api.post<{ message: string }>('/auth/register', { email, password, role }),

  login: (email: string, password: string) =>
    api.post<{ token: string; user: User }>('/auth/login', { email, password }),
};

export const inventoryApi = {
  getItems: (search?: string, page = 1, limit = 10) =>
    api.get<{ items: InventoryItem[]; total: number; pages: number }>('/inventory/items', {
      params: { search, page, limit },
    }),

  createItem: (name: string, quantity: number) =>
    api.post<InventoryItem>('/inventory/items', { name, quantity }),

  stockIn: (id: string, quantity: number) =>
    api.post<InventoryItem>(`/inventory/items/${id}/stock-in`, { quantity }),

  stockOut: (id: string, quantity: number) =>
    api.post<InventoryItem>(`/inventory/items/${id}/stock-out`, { quantity }),
};
