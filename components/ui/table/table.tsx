import { forwardRef } from 'react';

const Table = forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className = '', ...props }, ref) => (
    <table ref={ref} className={`w-full ${className}`.trim()} {...props} />
  )
);
Table.displayName = 'Table';

const TableHeader = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className = '', ...props }, ref) => (
    <thead ref={ref} className={`bg-gray-50 ${className}`.trim()} {...props} />
  )
);
TableHeader.displayName = 'TableHeader';

const TableBody = forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className = '', ...props }, ref) => (
    <tbody ref={ref} className={`bg-white divide-y divide-gray-200 ${className}`.trim()} {...props} />
  )
);
TableBody.displayName = 'TableBody';

const TableRow = forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className = '', ...props }, ref) => (
    <tr ref={ref} className={`hover:bg-gray-50 ${className}`.trim()} {...props} />
  )
);
TableRow.displayName = 'TableRow';

export type TableHeadSortOrder = 'asc' | 'desc' | null;

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  onSortClick?: () => void;
  sortOrder?: TableHeadSortOrder;
}

const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className = '', onSortClick, sortOrder = null, children, ...props }, ref) => (
    <th
      ref={ref}
      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`.trim()}
      {...props}
    >
      {onSortClick ? (
        <button
          type="button"
          onClick={onSortClick}
          className="inline-flex items-center gap-1 font-medium hover:text-gray-700"
        >
          {children}
          <span className={sortOrder !== null ? 'text-primary-600' : 'text-gray-300'}>
            {sortOrder === 'desc' ? '↓' : '↑'}
          </span>
        </button>
      ) : (
        children
      )}
    </th>
  )
);
TableHead.displayName = 'TableHead';

const TableCell = forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className = '', ...props }, ref) => (
    <td ref={ref} className={`px-6 py-4 whitespace-nowrap ${className}`.trim()} {...props} />
  )
);
TableCell.displayName = 'TableCell';

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
