import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightElement?: ReactNode;
}

export default function Input({
  label, error, hint, leftIcon, rightElement, className = '', id, ...rest
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-[11.5px] font-bold text-gray-500 dark:text-gray-400
            uppercase tracking-wider mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full py-2.5 rounded-lg border text-[13.5px] bg-white dark:bg-gray-800
            text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500
            outline-none transition-colors
            focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
            dark:focus:ring-blue-400/20 dark:focus:border-blue-400
            ${error
              ? 'border-red-400 bg-red-50/30 dark:bg-red-900/10'
              : 'border-gray-300 dark:border-gray-600'
            }
            ${leftIcon ? 'pl-9' : 'pl-4'}
            ${rightElement ? 'pr-10' : 'pr-4'}
            ${className}`}
          {...rest}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-[12px] text-red-600 dark:text-red-400 font-medium">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-[12px] text-gray-400">{hint}</p>}
    </div>
  );
}
