import React, { useEffect, useRef } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { PW_RULES, passwordStrength } from '../utils';

/* ─── Spinner ─────────────────────────────────────────────── */
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = { sm: 'h-3.5 w-3.5 border-[1.5px]', md: 'h-5 w-5 border-2', lg: 'h-8 w-8 border-2' }[size];
  return (
    <div className={`${s} animate-spin rounded-full border-white/30 border-t-white`} />
  );
}

/* ─── Table skeleton ──────────────────────────────────────── */
export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  const widths = ['42%', '12%', '18%', '16%', '22%'];
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="border-b border-gray-100 dark:border-gray-800/60 animate-pulse">
          {widths.map((w, c) => (
            <td key={c} className="px-6 py-4">
              <div className="h-3.5 bg-gray-100 dark:bg-gray-800 rounded-full" style={{ width: w }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/* ─── Animated counter ────────────────────────────────────── */
function useCountUp(target: number, duration = 400) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      if (ref.current) ref.current.textContent = String(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return ref;
}

/* ─── KPI Card ────────────────────────────────────────────── */
interface KpiCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  gradient: string;
  iconColor: string;
  loading?: boolean;
  description?: string;
}

export function KpiCard({ label, value, icon: Icon, gradient, iconColor, loading, description }: KpiCardProps) {
  const countRef = useCountUp(value, 700);

  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 shadow-card-md
      transition-all duration-300 hover:shadow-card-lg hover:-translate-y-0.5 ${gradient}`}>
      {/* Decorative circle */}
      <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-6 -right-2 w-16 h-16 rounded-full bg-white/5" />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Icon size={19} className={iconColor} />
          </div>
        </div>

        {loading ? (
          <div className="h-9 w-16 bg-white/20 rounded-lg animate-pulse" />
        ) : (
          <p className="text-[36px] font-bold text-white leading-none tracking-tight transition-all duration-300">
            <span ref={countRef}>0</span>
          </p>
        )}

        <p className="text-[12px] font-semibold text-white/80 mt-2 uppercase tracking-wider">{label}</p>
        {description && (
          <p className="text-[11px] text-white/60 mt-0.5">{description}</p>
        )}
      </div>
    </div>
  );
}

/* ─── Password strength ───────────────────────────────────── */
export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const { pct, label, color } = passwordStrength(password);
  const textColor = pct <= 40 ? 'text-red-500' : pct <= 60 ? 'text-amber-500' : pct <= 80 ? 'text-yellow-500' : 'text-emerald-600';

  return (
    <div className="mt-2.5 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
        </div>
        <span className={`text-[11px] font-bold ${textColor}`}>{label}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {PW_RULES.map((rule) => (
          <div key={rule.label} className="flex items-center gap-1.5">
            {rule.test(password)
              ? <CheckCircle size={11} className="text-emerald-500 shrink-0" />
              : <XCircle    size={11} className="text-gray-300 dark:text-gray-600 shrink-0" />
            }
            <span className={`text-[11px] ${rule.test(password) ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-400'}`}>
              {rule.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Error state ─────────────────────────────────────────── */
export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
      <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mb-4">
        <XCircle size={28} className="text-red-500" />
      </div>
      <p className="text-[15px] font-bold text-gray-700 dark:text-gray-200 mb-1">Failed to load data</p>
      <p className="text-[13px] text-gray-400 dark:text-gray-500 mb-5 max-w-[280px]">{message}</p>
      <button
        onClick={onRetry}
        className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500
          hover:to-violet-500 text-white text-[13px] font-semibold rounded-xl transition-all
          shadow-md hover:shadow-lg active:scale-[0.98]"
      >
        Try Again
      </button>
    </div>
  );
}
