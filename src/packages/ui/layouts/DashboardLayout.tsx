/**
 * DashboardLayout - Layout for admin/dashboard pages
 */

import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronLeft, type LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  badge?: string | number;
  children?: NavItem[];
}

export interface DashboardLayoutProps {
  children: ReactNode;
  /** Logo element */
  logo?: ReactNode;
  /** Navigation items */
  navItems: NavItem[];
  /** Currently active item ID */
  activeItem?: string;
  /** Header content (right side) */
  headerContent?: ReactNode;
  /** Sidebar footer content */
  sidebarFooter?: ReactNode;
  /** Sidebar collapsed by default */
  defaultCollapsed?: boolean;
  /** Mobile breakpoint (default: 768) */
  mobileBreakpoint?: number;
}

export function DashboardLayout({
  children,
  logo,
  navItems,
  activeItem,
  headerContent,
  sidebarFooter,
  defaultCollapsed = false,
}: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-bg">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full bg-white dark:bg-dark-card border-r border-gray-200 dark:border-white/10',
          'transition-all duration-300 ease-in-out',
          // Desktop
          'hidden lg:block',
          collapsed ? 'lg:w-20' : 'lg:w-64',
        )}
      >
        <SidebarContent
          logo={logo}
          navItems={navItems}
          activeItem={activeItem}
          collapsed={collapsed}
          footer={sidebarFooter}
        />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-dark-card border-r border-gray-200 dark:border-white/10 lg:hidden"
          >
            <SidebarContent
              logo={logo}
              navItems={navItems}
              activeItem={activeItem}
              collapsed={false}
              onClose={() => setMobileOpen(false)}
              footer={sidebarFooter}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div
        className={cn(
          'transition-all duration-300',
          collapsed ? 'lg:ml-20' : 'lg:ml-64'
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-white/10">
          <div className="h-full px-4 flex items-center justify-between">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop collapse button */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
            >
              <ChevronLeft
                className={cn(
                  'w-5 h-5 transition-transform',
                  collapsed && 'rotate-180'
                )}
              />
            </button>

            {/* Header content */}
            <div className="flex-1 flex items-center justify-end">
              {headerContent}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

/** Sidebar content component */
function SidebarContent({
  logo,
  navItems,
  activeItem,
  collapsed,
  onClose,
  footer,
}: {
  logo?: ReactNode;
  navItems: NavItem[];
  activeItem?: string;
  collapsed: boolean;
  onClose?: () => void;
  footer?: ReactNode;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-white/10">
        {!collapsed && logo}
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <NavItemComponent
              key={item.id}
              item={item}
              isActive={activeItem === item.id}
              collapsed={collapsed}
            />
          ))}
        </ul>
      </nav>

      {/* Footer */}
      {footer && (
        <div className="p-4 border-t border-gray-200 dark:border-white/10">
          {footer}
        </div>
      )}
    </div>
  );
}

/** Navigation item component */
function NavItemComponent({
  item,
  isActive,
  collapsed,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon;

  return (
    <li>
      <button
        onClick={item.onClick}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl',
          'text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary-500 text-white'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10',
          collapsed && 'justify-center'
        )}
        title={collapsed ? item.label : undefined}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge && (
              <span className={cn(
                'px-2 py-0.5 text-xs rounded-full',
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-primary-500/10 text-primary-500'
              )}>
                {item.badge}
              </span>
            )}
          </>
        )}
      </button>
    </li>
  );
}
