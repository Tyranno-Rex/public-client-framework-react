/**
 * MobileLayout - Layout for mobile-first applications
 */

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, type LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface MobileLayoutProps {
  children: ReactNode;
  /** Show header */
  showHeader?: boolean;
  /** Header title */
  title?: string;
  /** Show back button */
  showBack?: boolean;
  /** Back button click handler */
  onBack?: () => void;
  /** Left side of header */
  headerLeft?: ReactNode;
  /** Right side of header */
  headerRight?: ReactNode;
  /** Show bottom navigation */
  showNavigation?: boolean;
  /** Navigation items */
  navItems?: MobileNavItem[];
  /** Active navigation item */
  activeNav?: string;
  /** Navigation change handler */
  onNavChange?: (id: string) => void;
  /** Safe area padding */
  safeArea?: boolean;
  /** Additional class name */
  className?: string;
}

export interface MobileNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

export function MobileLayout({
  children,
  showHeader = true,
  title,
  showBack,
  onBack,
  headerLeft,
  headerRight,
  showNavigation = true,
  navItems = [],
  activeNav,
  onNavChange,
  safeArea = true,
  className,
}: MobileLayoutProps) {
  return (
    <div
      className={cn(
        'min-h-screen flex flex-col bg-gray-50 dark:bg-dark-bg',
        className
      )}
    >
      {/* Header */}
      {showHeader && (
        <header
          className={cn(
            'sticky top-0 z-40 bg-white dark:bg-dark-card',
            'border-b border-gray-200 dark:border-white/10',
            safeArea && 'safe-area-inset-top'
          )}
        >
          <div className="h-14 flex items-center justify-between px-4">
            {/* Left */}
            <div className="flex items-center gap-2 min-w-[60px]">
              {showBack && (
                <button
                  onClick={onBack}
                  className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              {headerLeft}
            </div>

            {/* Title */}
            {title && (
              <h1 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                {title}
              </h1>
            )}

            {/* Right */}
            <div className="flex items-center gap-2 min-w-[60px] justify-end">
              {headerRight}
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main
        className={cn(
          'flex-1',
          showNavigation && 'pb-16'
        )}
      >
        {children}
      </main>

      {/* Bottom Navigation */}
      {showNavigation && navItems.length > 0 && (
        <nav
          className={cn(
            'fixed bottom-0 left-0 right-0 z-40',
            'bg-white dark:bg-dark-card',
            'border-t border-gray-200 dark:border-white/10',
            safeArea && 'safe-area-inset-bottom'
          )}
        >
          <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;

              return (
                <motion.button
                  key={item.id}
                  onClick={() => onNavChange?.(item.id)}
                  className={cn(
                    'relative flex flex-col items-center justify-center gap-1 w-16 py-2',
                    'transition-colors',
                    isActive
                      ? 'text-primary-500'
                      : 'text-gray-500 dark:text-gray-400'
                  )}
                  whileTap={{ scale: 0.9 }}
                >
                  <div className="relative">
                    <Icon className="w-5 h-5" />
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="mobile-nav-indicator"
                      className="absolute top-0 w-12 h-0.5 bg-primary-500 rounded-full"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
