import { ReactNode } from 'react';

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h1 className={`text-3xl font-bold text-gray-900 mb-2 ${className}`}>
      {children}
    </h1>
  );
}
