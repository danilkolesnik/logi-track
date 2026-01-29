import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label htmlFor={props.id} className="text-sm font-semibold text-gray-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all focus:border-primary-600 focus:outline-none focus:ring-3 focus:ring-primary-100 disabled:bg-gray-100 disabled:cursor-not-allowed resize-y font-inherit ${error ? 'border-red-500' : ''} ${className}`}
          {...props}
        />
        {error && (
          <span className="text-sm text-red-600">{error}</span>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
