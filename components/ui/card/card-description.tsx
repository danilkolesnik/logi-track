import { ReactNode } from 'react';

interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function CardDescription({ children, className = '' }: CardDescriptionProps) {
  return (
    <p className={`text-gray-600 ${className}`}>
      {children}
    </p>
  );
}
