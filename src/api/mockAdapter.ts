/**
 * Mock API adapter — simulates a real REST backend with JWT auth & RBAC.
 * Remove setupMockAdapter() call in axios.ts when connecting to a real backend.
 *
 * Endpoints:
 *   POST /auth/register
 *   POST /auth/login
 *   GET  /inventory/items          (any authenticated user)
 *   POST /inventory/items          (ADMIN only)
 *   POST /inventory/items/:id/stock-in   (ADMIN only)
 *   POST /inventory/items/:id/stock-out  (ADMIN only)
 */
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import type { InventoryItem, User, Role } from '../types';

// ─────────────────────────────────────────────
// In-memory data store
// ─────────────────────────────────────────────

const USERS: (User & { password: string })[] = [
  { id: '1', email: 'admin@demo.com', role: 'ADMIN', password: 'Admin@123' },
  { id: '2', email: 'staff@demo.com', role: 'STAFF', password: 'Staff@123' },
];

let ITEMS: InventoryItem[] = [
  { id: '1',  name: 'Wireless Keyboard',           quantity: 45, status: 'IN_STOCK',     createdAt: '2024-01-10T10:00:00Z' },
  { id: '2',  name: 'USB-C Hub',                   quantity: 8,  status: 'LOW_STOCK',    createdAt: '2024-01-12T10:00:00Z' },
  { id: '3',  name: 'Monitor Stand',               quantity: 0,  status: 'OUT_OF_STOCK', createdAt: '2024-01-14T10:00:00Z' },
  { id: '4',  name: 'Mechanical Mouse',            quantity: 23, status: 'IN_STOCK',     createdAt: '2024-01-15T10:00:00Z' },
  { id: '5',  name: 'Laptop Sleeve',               quantity: 3,  status: 'LOW_STOCK',    createdAt: '2024-01-16T10:00:00Z' },
  { id: '6',  name: 'HDMI Cable',                  quantity: 60, status: 'IN_STOCK',     createdAt: '2024-01-17T10:00:00Z' },
  { id: '7',  name: 'Webcam HD',                   quantity: 0,  status: 'OUT_OF_STOCK', createdAt: '2024-01-18T10:00:00Z' },
  { id: '8',  name: 'Desk Lamp',                   quantity: 15, status: 'IN_STOCK',     createdAt: '2024-01-19T10:00:00Z' },
  { id: '9',  name: 'Ethernet Cable',              quantity: 7,  status: 'LOW_STOCK',    createdAt: '2024-01-20T10:00:00Z' },
  { id: '10', name: 'USB Flash Drive',             quantity: 32, status: 'IN_STOCK',     createdAt: '2024-01-21T10:00:00Z' },
  { id: '11', name: 'Laptop Stand',                quantity: 0,  status: 'OUT_OF_STOCK', createdAt: '2024-01-22T10:00:00Z' },
  { id: '12', name: 'Noise Cancelling Headphones', quantity: 5,  status: 'LOW_STOCK',    createdAt: '2024-01-23T10:00:00Z' },
];

// ─────────────────────────────────────────────
// JWT helpers
// ─────────────────────────────────────────────

interface TokenPayload {
  id: string;
  email: string;
  role: Role;
  exp: number; // Unix ms timestamp
}

/** Encode a Base64url-safe string (browser-compatible). */
function b64(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Build a JWT-like token: base64(header).base64(payload).base64(signature).
 * The "signature" is a simple HMAC-style hash derived from the payload — good
 * enough for a mock; a real backend would use RS256/HS256.
 */
function makeToken(user: User): string {
  const header  = b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = b64(JSON.stringify({
    id:    user.id,
    email: user.email,
    role:  user.role,
    exp:   Date.now() + 24 * 60 * 60 * 1000, // 24 h
  } satisfies TokenPayload));
  // Deterministic mock signature — not cryptographically secure
  const sig = b64(`mock-sig::${user.id}::${user.role}`);
  return `${header}.${payload}.${sig}`;
}

/** Decode the payload segment of a JWT-like token. Returns null on any error. */
function decodeToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    // Restore standard Base64 padding before decoding
    const padded = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json   = atob(padded.padEnd(padded.length + (4 - (padded.length % 4)) % 4, '='));
    return JSON.parse(json) as TokenPayload;
  } catch {
    return null;
  }
}

/** Returns true when the token is missing, malformed, or past its expiry. */
function isTokenExpired(payload: TokenPayload): boolean {
  return Date.now() > payload.exp;
}

/**
 * Extract the Bearer token from the Authorization header, decode it, and
 * return the payload.  Returns null if the header is absent or malformed.
 */
function getUserFromToken(config: InternalAxiosRequestConfig): TokenPayload | null {
  const auth = config.headers?.Authorization as string | undefined;
  if (!auth?.startsWith('Bearer ')) return null;
  return decodeToken(auth.slice(7));
}

/**
 * Returns true only when the authenticated user holds one of the allowed roles.
 * Pass an empty array to allow any authenticated user regardless of role.
 */
function isAuthorized(payload: TokenPayload, roles: Role[]): boolean {
  return roles.length === 0 || roles.includes(payload.role);
}

// ─────────────────────────────────────────────
// Response helpers
// ─────────────────────────────────────────────

function ok(config: InternalAxiosRequestConfig, data: unknown, status = 200): AxiosResponse {
  return { data, status, statusText: 'OK', headers: {}, config };
}

function fail(
  config: InternalAxiosRequestConfig,
  status: number,
  message: string,
): Promise<never> {
  return Promise.reject(
    Object.assign(new Error(message), {
      response: { data: { message }, status, statusText: '', headers: {}, config },
      isAxiosError: true,
    }),
  );
}

/** Minimal delay — just enough to let React paint the skeleton before data arrives. */
const delay = () => new Promise((r) => setTimeout(r, 80));

// ─────────────────────────────────────────────
// Business logic helpers
// ─────────────────────────────────────────────

function calcStatus(qty: number): InventoryItem['status'] {
  if (qty === 0)   return 'OUT_OF_STOCK';
  if (qty <= 10)   return 'LOW_STOCK';
  return 'IN_STOCK';
}

/**
 * Guard helper for protected inventory routes.
 * Returns the decoded payload on success, or a rejected Promise on failure.
 */
function requireAuth(
  config: InternalAxiosRequestConfig,
  roles: Role[] = [],
): TokenPayload | Promise<never> {
  const payload = getUserFromToken(config);

  if (!payload)                    return fail(config, 401, 'Authentication required. Please sign in.');
  if (isTokenExpired(payload))     return fail(config, 401, 'Session expired. Please sign in again.');
  if (!isAuthorized(payload, roles))
    return fail(config, 403, 'Access denied. This action requires ADMIN privileges.');

  return payload;
}

// ─────────────────────────────────────────────
// Mock adapter
// ─────────────────────────────────────────────

export function setupMockAdapter(instance: AxiosInstance) {
  instance.defaults.adapter = async (
    config: InternalAxiosRequestConfig,
  ): Promise<AxiosResponse> => {
    await delay();

    const url    = config.url ?? '';
    const method = config.method?.toLowerCase() ?? '';
    const body   = config.data ? JSON.parse(config.data) : {};

    // ── POST /auth/register ──────────────────────────────────────────────
    if (url.includes('/auth/register') && method === 'post') {
      const { email, password, role } = body as {
        email?: string; password?: string; role?: string;
      };

      if (!email?.trim())    return fail(config, 400, 'Email is required.');
      if (!password?.trim()) return fail(config, 400, 'Password is required.');

      if (USERS.find((u) => u.email === email))
        return fail(config, 409, 'An account with this email already exists.');

      const newUser: User & { password: string } = {
        id:       String(Date.now()),
        email:    email.trim(),
        role:     (role === 'ADMIN' ? 'ADMIN' : 'STAFF') as Role,
        password: password.trim(),
      };
      USERS.push(newUser);
      return ok(config, { message: 'Account created successfully. Please sign in.' });
    }

    // ── POST /auth/login ─────────────────────────────────────────────────
    if (url.includes('/auth/login') && method === 'post') {
      const { email, password } = body as { email?: string; password?: string };

      if (!email?.trim() || !password?.trim())
        return fail(config, 400, 'Email and password are required.');

      const user = USERS.find(
        (u) => u.email === email.trim() && u.password === password.trim(),
      );
      if (!user) return fail(config, 401, 'Invalid email or password.');

      const { password: _pw, ...safeUser } = user;
      return ok(config, { token: makeToken(safeUser), user: safeUser });
    }

    // ── GET /inventory/items ─────────────────────────────────────────────
    if (url.includes('/inventory/items') && method === 'get') {
      // Any authenticated user (ADMIN or STAFF) may read
      const auth = requireAuth(config, []);
      if (auth instanceof Promise) return auth;

      const { search = '', page = '1', limit = '10' } = config.params ?? {};
      const q        = String(search).toLowerCase().trim();
      const filtered = q
        ? ITEMS.filter((i) => i.name.toLowerCase().includes(q))
        : ITEMS;

      const p     = Math.max(1, parseInt(String(page),  10));
      const l     = Math.max(1, parseInt(String(limit), 10));
      const start = (p - 1) * l;

      return ok(config, {
        items: filtered.slice(start, start + l),
        total: filtered.length,
        pages: Math.max(1, Math.ceil(filtered.length / l)),
      });
    }

    // ── POST /inventory/items ────────────────────────────────────────────
    if (url.endsWith('/inventory/items') && method === 'post') {
      // ADMIN only
      const auth = requireAuth(config, ['ADMIN']);
      if (auth instanceof Promise) return auth;

      const { name, quantity } = body as { name?: string; quantity?: unknown };

      if (!name?.trim())
        return fail(config, 400, 'Item name is required.');
      if (quantity === undefined || quantity === null || quantity === '')
        return fail(config, 400, 'Quantity is required.');

      const qty = Number(quantity);
      if (isNaN(qty) || qty < 0)
        return fail(config, 400, 'Quantity must be a non-negative number.');

      const item: InventoryItem = {
        id:        String(Date.now()),
        name:      name.trim(),
        quantity:  qty,
        status:    calcStatus(qty),
        createdAt: new Date().toISOString(),
      };
      ITEMS = [item, ...ITEMS];
      return ok(config, item, 201);
    }

    // ── POST /inventory/items/:id/stock-in ───────────────────────────────
    if (url.includes('/stock-in') && method === 'post') {
      // ADMIN only
      const auth = requireAuth(config, ['ADMIN']);
      if (auth instanceof Promise) return auth;

      const id   = url.split('/inventory/items/')[1]?.split('/')[0];
      const item = ITEMS.find((i) => i.id === id);
      if (!item) return fail(config, 404, 'Item not found.');

      const qty = Number(body.quantity);
      if (!body.quantity || isNaN(qty) || qty <= 0)
        return fail(config, 400, 'Quantity to add must be greater than 0.');

      item.quantity += qty;
      item.status    = calcStatus(item.quantity);
      return ok(config, { ...item });
    }

    // ── POST /inventory/items/:id/stock-out ──────────────────────────────
    if (url.includes('/stock-out') && method === 'post') {
      // ADMIN only
      const auth = requireAuth(config, ['ADMIN']);
      if (auth instanceof Promise) return auth;

      const id   = url.split('/inventory/items/')[1]?.split('/')[0];
      const item = ITEMS.find((i) => i.id === id);
      if (!item) return fail(config, 404, 'Item not found.');

      const qty = Number(body.quantity);
      if (!body.quantity || isNaN(qty) || qty <= 0)
        return fail(config, 400, 'Quantity to use must be greater than 0.');
      if (qty > item.quantity)
        return fail(config, 400, `Insufficient stock. Only ${item.quantity} unit(s) available.`);

      item.quantity -= qty;
      item.status    = calcStatus(item.quantity);
      return ok(config, { ...item });
    }

    return fail(config, 404, 'Endpoint not found.');
  };
}
