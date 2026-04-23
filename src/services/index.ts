/**
 * services/index.ts
 * Barrel export — import from 'services' in one line anywhere in the app.
 *
 * Usage:
 *   import { AuthService, InventoryService } from '../services';
 *   import type { LoginResult, ItemsResult } from '../services';
 */

export { AuthService }                          from './auth.service';
export type { LoginResult, RegisterResult }     from './auth.service';

export { InventoryService }                     from './inventory.service';
export type { ItemsResult }                     from './inventory.service';
