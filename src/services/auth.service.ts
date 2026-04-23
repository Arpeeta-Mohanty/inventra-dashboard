/**
 * services/auth.service.ts
 *
 * Handles all authentication-related API calls.
 * Components and hooks import from here — never directly from api/inventory.ts.
 */

import { authApi } from '../api/inventory';
import type { User } from '../types';

export interface LoginResult {
  token: string;
  user: User;
}

export interface RegisterResult {
  message: string;
}

export const AuthService = {
  /**
   * Authenticate a user with email + password.
   * Returns a JWT token and the authenticated user object.
   */
  login: (email: string, password: string): Promise<LoginResult> =>
    authApi.login(email, password).then((r) => r.data as LoginResult),

  /**
   * Register a new user account.
   * Returns a success message; the UI then redirects to /login.
   */
  register: (email: string, password: string, role: string): Promise<RegisterResult> =>
    authApi.register(email, password, role).then((r) => r.data as RegisterResult),
};
