import { ReactNode } from 'react';

export interface DetailsListItem {
  label: string;
  value: ReactNode;
}

interface DetailsListProps {
  items: DetailsListItem[];
  className?: string;
}

export function DetailsList({ items, className = '' }: DetailsListProps) {
  return (
    <dl className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${className}`}>
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-sm font-medium text-gray-500">{item.label}</dt>
          <dd className="mt-1 text-sm text-gray-900">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
