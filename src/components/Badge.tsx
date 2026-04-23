type BadgeVariant = 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'gray';

interface BadgeProps {
  variant: BadgeVariant;
  dot?: boolean;
  glow?: boolean;
  children: React.ReactNode;
  className?: string;
}

const STYLES: Record<BadgeVariant, { badge: string; dot: string; glowClass: string }> = {
  green:  {
    badge:     'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    dot:       'bg-emerald-500',
    glowClass: 'glow-green',
  },
  yellow: {
    badge:     'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    dot:       'bg-amber-500',
    glowClass: 'glow-yellow',
  },
  red: {
    badge:     'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    dot:       'bg-red-500',
    glowClass: 'glow-red',
  },
  blue: {
    badge:     'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    dot:       'bg-blue-500',
    glowClass: '',
  },
  purple: {
    badge:     'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800',
    dot:       'bg-violet-500',
    glowClass: '',
  },
  gray: {
    badge:     'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
    dot:       'bg-gray-400',
    glowClass: '',
  },
};

export default function Badge({ variant, dot = false, glow = false, children, className = '' }: BadgeProps) {
  const s = STYLES[variant];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
      text-[11.5px] font-semibold border ${s.badge} ${className}`}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot} ${glow ? s.glowClass : ''}`} />
      )}
      {children}
    </span>
  );
}
