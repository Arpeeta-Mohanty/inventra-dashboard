import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Spinner } from './Loader';

type Variant = 'primary' | 'gradient' | 'secondary' | 'danger' | 'ghost' | 'success';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

const VARIANT: Record<Variant, string> = {
  primary:   'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm hover:shadow-md disabled:bg-blue-400',
  gradient:  'bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 active:from-blue-700 active:to-violet-700 text-white shadow-md hover:shadow-lg disabled:opacity-60',
  secondary: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
  danger:    'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-sm hover:shadow-md disabled:bg-red-400',
  success:   'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm hover:shadow-md disabled:bg-emerald-400',
  ghost:     'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
};

const SIZE: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-[12px] gap-1.5 rounded-lg',
  md: 'px-4 py-2.5 text-[13.5px] gap-2 rounded-xl',
  lg: 'px-5 py-3 text-[14px] gap-2 rounded-xl',
};

export default function Button({
  variant = 'primary', size = 'md', loading, icon, children, disabled, className = '', ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-semibold transition-all duration-200
        disabled:cursor-not-allowed select-none active:scale-[0.98]
        ${VARIANT[variant]} ${SIZE[size]} ${className}`}
      {...rest}
    >
      {loading ? <Spinner size="sm" /> : icon}
      {children}
    </button>
  );
}
