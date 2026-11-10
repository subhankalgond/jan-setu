import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'editorial';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.99]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 font-medium',
    md: 'text-sm px-4 py-2 gap-2 font-medium',
    lg: 'text-sm sm:text-base px-5 py-2.5 gap-2.5 font-semibold'
  };

  const variantStyles = {
    primary: 'bg-[#111111] text-white hover:bg-[#262626] border border-[#111111]',
    secondary: 'bg-[#F7F7F6] text-[#111111] hover:bg-[#EEEEEC] border border-[#E5E5E5]',
    outline: 'border border-[#E5E5E5] bg-white text-[#111111] hover:bg-[#F7F7F6]',
    ghost: 'text-[#111111] hover:bg-[#F7F7F6]',
    danger: 'bg-[#DC2626] text-white hover:bg-[#B91C1C] border border-[#DC2626]',
    editorial: 'bg-[#111111] text-white hover:bg-[#262626] border border-[#111111]'
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, sizeStyles[size], variantStyles[variant], className))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {children}
    </button>
  );
};
