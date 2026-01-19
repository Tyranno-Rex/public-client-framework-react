/**
 * MainLayout - App shell with navigation
 */

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Home, Search, Bell, User, type LucideIcon } from 'lucide-react';
import { useTheme } from '../../packages/theme';
import { cn } from '../../packages/utils';

interface MainLayoutProps {
  children: ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  showNavigation?: boolean;
}

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { id: 'home', label: '홈', icon: Home },
  { id: 'search', label: '검색', icon: Search },
  { id: 'notifications', label: '알림', icon: Bell },
  { id: 'profile', label: '프로필', icon: User },
];

export function MainLayout({
  children,
  activeTab = 'home',
  onTabChange,
  showNavigation = true,
}: MainLayoutProps) {
  const { isDark } = useTheme();

  return (
    <div className={cn(
      'min-h-screen',
      isDark ? 'bg-dark-bg text-white' : 'bg-light-bg text-gray-900'
    )}>
      {/* Main Content */}
      <main className={cn(showNavigation && 'pb-20')}>
        {children}
      </main>

      {/* Bottom Navigation */}
      {showNavigation && (
        <nav className={cn(
          'fixed bottom-0 left-0 right-0 z-40',
          'safe-area-inset-bottom',
          isDark ? 'bg-dark-card border-t border-white/10' : 'bg-white border-t border-gray-200'
        )}>
          <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <motion.button
                  key={item.id}
                  onClick={() => onTabChange?.(item.id)}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 w-16 py-2',
                    'transition-colors',
                    isActive
                      ? 'text-primary-500'
                      : isDark ? 'text-gray-500' : 'text-gray-400'
                  )}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
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

export default MainLayout;
