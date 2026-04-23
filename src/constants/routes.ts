/**
 * constants/routes.ts
 * Centralised route path definitions — avoids magic strings in components.
 */

export const ROUTES = {
  ROOT:      '/',
  LOGIN:     '/login',
  REGISTER:  '/register',
  DASHBOARD: '/dashboard',
  INVENTORY: '/inventory',
  ANALYTICS: '/analytics',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
