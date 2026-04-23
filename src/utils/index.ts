// ── Password validation rules ──────────────────────────────
export const PW_RULES = [
  { label: 'At least 8 characters',  test: (p: string) => p.length >= 8           },
  { label: 'One uppercase letter',   test: (p: string) => /[A-Z]/.test(p)         },
  { label: 'One lowercase letter',   test: (p: string) => /[a-z]/.test(p)         },
  { label: 'One number',             test: (p: string) => /\d/.test(p)            },
  { label: 'One special character',  test: (p: string) => /[^A-Za-z0-9]/.test(p)  },
];

export function passwordStrength(password: string): { passed: number; pct: number; label: string; color: string } {
  const passed = PW_RULES.filter((r) => r.test(password)).length;
  const pct    = (passed / PW_RULES.length) * 100;
  const label  = pct <= 40 ? 'Weak' : pct <= 60 ? 'Fair' : pct <= 80 ? 'Good' : 'Strong';
  const color  = pct <= 40 ? 'bg-red-500' : pct <= 60 ? 'bg-amber-500' : pct <= 80 ? 'bg-yellow-400' : 'bg-emerald-500';
  return { passed, pct, label, color };
}

export function isPasswordStrong(password: string): boolean {
  return PW_RULES.every((r) => r.test(password));
}

// ── Email validation ───────────────────────────────────────
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── Shared stats calculation (single source of truth) ────
export interface InventoryStats {
  total: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalUnits: number;
}

export function calcStats(items: { quantity: number }[]): InventoryStats {
  let inStock = 0, lowStock = 0, outOfStock = 0, totalUnits = 0;
  for (const item of items) {
    totalUnits += item.quantity;
    if (item.quantity === 0)      outOfStock++;
    else if (item.quantity <= 10) lowStock++;
    else                          inStock++;
  }
  return { total: items.length, inStock, lowStock, outOfStock, totalUnits };
}

// ── Status derivation ──────────────────────────────────────
export function deriveStatus(qty: number): 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' {
  if (qty === 0) return 'OUT_OF_STOCK';
  if (qty <= 10) return 'LOW_STOCK';
  return 'IN_STOCK';
}

// ── Date formatting ────────────────────────────────────────
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Class name helper ──────────────────────────────────────
export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
