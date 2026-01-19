/**
 * TabButton - Tab navigation button
 */

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  count?: number;
  icon?: ReactNode;
  className?: string;
}

export function TabButton({
  active,
  onClick,
  children,
  count,
  icon,
  className,
}: TabButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'relative flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
        active
          ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10'
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5',
        className
      )}
      whileTap={{ scale: 0.97 }}
    >
      {icon}
      {children}
      {count !== undefined && count > 0 && (
        <span className={cn(
          'ml-1 px-1.5 py-0.5 text-[10px] font-semibold rounded-full',
          active
            ? 'bg-primary-500 text-white'
            : 'bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400'
        )}>
          {count}
        </span>
      )}
    </motion.button>
  );
}

// Tab bar container
export interface TabBarProps {
  children: ReactNode;
  className?: string;
}

export function TabBar({ children, className }: TabBarProps) {
  return (
    <div className={cn('flex gap-1 p-1 overflow-x-auto no-scrollbar', className)}>
      {children}
    </div>
  );
}

export default TabButton;
