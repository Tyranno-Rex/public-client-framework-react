/**
 * ListItem - Clickable list item with flexible layout
 */

import { forwardRef, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface ListItemProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  leftContent?: ReactNode;
  rightContent?: ReactNode;
  showChevron?: boolean;
  disabled?: boolean;
  divider?: boolean;
}

export const ListItem = forwardRef<HTMLDivElement, ListItemProps>(
  ({
    children,
    leftContent,
    rightContent,
    showChevron = false,
    disabled = false,
    divider = false,
    className,
    onClick,
    ...props
  }, ref) => {
    const isClickable = !!onClick && !disabled;

    return (
      <motion.div
        ref={ref}
        className={cn(
          'flex items-center gap-3 p-3 rounded-xl',
          isClickable && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 active:bg-gray-100 dark:active:bg-white/10',
          disabled && 'opacity-50 cursor-not-allowed',
          divider && 'border-b border-gray-100 dark:border-white/10 rounded-none',
          className
        )}
        onClick={disabled ? undefined : onClick}
        whileHover={isClickable ? { x: 2 } : undefined}
        whileTap={isClickable ? { scale: 0.99 } : undefined}
        {...props}
      >
        {leftContent && (
          <div className="flex-shrink-0">
            {leftContent}
          </div>
        )}

        <div className="flex-1 min-w-0">
          {children}
        </div>

        {rightContent && (
          <div className="flex-shrink-0">
            {rightContent}
          </div>
        )}

        {showChevron && (
          <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
        )}
      </motion.div>
    );
  }
);

ListItem.displayName = 'ListItem';

export default ListItem;
