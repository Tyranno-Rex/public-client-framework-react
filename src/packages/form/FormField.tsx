/**
 * FormField - Wrapper component for form inputs
 */

import { type ReactNode } from 'react';
import { cn } from '../utils/cn';

export interface FormFieldProps {
  /** Field label */
  label?: string;
  /** Field name (for htmlFor) */
  name?: string;
  /** Error message */
  error?: string | null;
  /** Hint text */
  hint?: string;
  /** Required indicator */
  required?: boolean;
  /** Children (input element) */
  children: ReactNode;
  /** Additional class name */
  className?: string;
}

export function FormField({
  label,
  name,
  error,
  hint,
  required,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {children}

      {(error || hint) && (
        <p
          className={cn(
            'text-xs',
            error ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
          )}
        >
          {error || hint}
        </p>
      )}
    </div>
  );
}
