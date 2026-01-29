import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-semibold rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed';
  
  const variantStyles = {
    primary: 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:-translate-y-0.5 hover:shadow-lg',
    secondary: 'bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-600',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3.5 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
