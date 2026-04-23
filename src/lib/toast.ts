/**
 * Centralised toast notification system.
 * Import `notify` everywhere instead of calling toast directly —
 * keeps tone, phrasing, and duration consistent across the whole app.
 */
import toast from 'react-hot-toast';

const units = (qty: number) => (qty === 1 ? 'unit' : 'units');

// ── Auth ─────────────────────────────────────────────────────────────────────

function welcome(email: string, role: string) {
  const name = email?.split('@')[0] || (role === 'ADMIN' ? 'Admin' : 'Staff');
  toast.success(`Welcome back, ${name}.`);
}

function loginError(msg?: string) {
  toast.error(msg || 'Invalid email or password.');
}

function registered() {
  toast.success('Account created successfully.');
}

function registerError(msg?: string) {
  toast.error(msg || 'Registration failed. Please try again.');
}

function sessionExpired() {
  toast.error('Session expired. Please sign in again.');
}

// ── Inventory ─────────────────────────────────────────────────────────────────

function itemAdded(name: string) {
  toast.success(`${name} added to inventory.`);
}

function itemAddError(msg?: string) {
  toast.error(msg || 'Failed to add item. Please try again.');
}

function stockIn(qty: number, name: string) {
  toast.success(`${qty} ${units(qty)} added to ${name}.`);
}

function stockInError(msg?: string) {
  toast.error(msg || 'Failed to update stock. Please try again.');
}

function stockOut(qty: number, name: string) {
  toast.success(`${qty} ${units(qty)} removed from ${name}.`);
}

function stockOutError(msg?: string) {
  toast.error(msg || 'Failed to update stock. Please try again.');
}

function insufficientStock(available: number, name: string) {
  toast.error(`Only ${available} ${units(available)} available for ${name}.`);
}

// ── General ───────────────────────────────────────────────────────────────────

function apiError(msg?: string) {
  toast.error(msg || 'Something went wrong. Please try again.');
}

function unauthorized() {
  toast.error('You are not authorized to perform this action.');
}

function loadError(msg?: string) {
  toast.error(msg || 'Failed to load data. Please try again.');
}

// ── Export ────────────────────────────────────────────────────────────────────

export const notify = {
  welcome,
  loginError,
  registered,
  registerError,
  sessionExpired,
  itemAdded,
  itemAddError,
  stockIn,
  stockInError,
  stockOut,
  stockOutError,
  insufficientStock,
  apiError,
  unauthorized,
  loadError,
};
