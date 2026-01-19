/**
 * AppCard - Base card component with dark mode support
 */

import { forwardRef, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface AppCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'elevated' | 'outlined';
  interactive?: boolean;
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
};

const variantClasses = {
  default: 'bg-white dark:bg-dark-card shadow-sm',
  elevated: 'bg-white dark:bg-dark-card shadow-md',
  outlined: 'bg-transparent border border-gray-200 dark:border-white/10',
};

export const AppCard = forwardRef<HTMLDivElement, AppCardProps>(
  ({
    children,
    padding = 'md',
    variant = 'default',
    interactive = false,
    className,
    onClick,
    ...props
  }, ref) => {
    const isClickable = interactive || !!onClick;

    return (
      <motion.div
        ref={ref}
        className={cn(
          'rounded-2xl overflow-hidden',
          variantClasses[variant],
          paddingClasses[padding],
          isClickable && 'cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.98]',
          className
        )}
        onClick={onClick}
        whileHover={isClickable ? { scale: 1.01 } : undefined}
        whileTap={isClickable ? { scale: 0.98 } : undefined}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

AppCard.displayName = 'AppCard';

export default AppCard;
