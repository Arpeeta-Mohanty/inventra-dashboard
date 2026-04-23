/**
 * constants/roles.ts
 * Single source of truth for user roles used across the app.
 */

export const ROLES = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
