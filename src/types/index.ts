export type Role = 'ADMIN' | 'STAFF';

export interface User {
  id: string;
  email: string;
  role: Role;
}

export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  status: StockStatus;
  createdAt: string;
}
