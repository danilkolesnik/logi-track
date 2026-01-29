import { ReactNode } from 'react';

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`text-center mb-8 ${className}`}>
      {children}
    </div>
  );
}
