/**
 * ProfilePage - Example profile page
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Shield, Globe, HelpCircle, LogOut, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../packages/theme';
import { AppCard, ListItem, ConfirmModal, toast } from '../../packages/ui';
import { cn } from '../../packages/utils';

export function ProfilePage() {
  const { isDark, toggleTheme } = useTheme();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const settingsItems = [
    { icon: Bell, label: '알림 설정', description: '푸시 알림 관리' },
    { icon: Shield, label: '보안', description: '비밀번호, 인증 설정' },
    { icon: Globe, label: '언어', description: '한국어' },
    { icon: HelpCircle, label: '고객센터', description: '도움말, 문의하기' },
  ];

  const handleLogout = () => {
    setShowLogoutModal(false);
    toast.success('로그아웃되었습니다');
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <AppCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-2xl">
              👤
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold">사용자</h1>
              <p className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-500')}>
                user@example.com
              </p>
            </div>
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10">
              <Settings className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </AppCard>
      </motion.div>

      {/* Theme Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <AppCard padding="none">
          <button
            onClick={toggleTheme}
            className={cn(
              'w-full flex items-center gap-3 p-4',
              'hover:bg-gray-50 dark:hover:bg-white/5 transition-colors'
            )}
          >
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              isDark ? 'bg-amber-500/20' : 'bg-amber-100'
            )}>
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-amber-600" />
              )}
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium">테마</p>
              <p className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-500')}>
                {isDark ? '다크 모드' : '라이트 모드'}
              </p>
            </div>
            <div className={cn(
              'w-11 h-6 rounded-full p-1 transition-colors',
              isDark ? 'bg-primary-500' : 'bg-gray-300'
            )}>
              <motion.div
                className="w-4 h-4 bg-white rounded-full shadow"
                animate={{ x: isDark ? 20 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </div>
          </button>
        </AppCard>
      </motion.div>

      {/* Settings List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <AppCard padding="none">
          <div className="p-4 border-b border-gray-100 dark:border-white/10">
            <h2 className="font-semibold">설정</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-white/10">
            {settingsItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <ListItem
                  key={index}
                  leftContent={
                    <div className={cn(
                      'w-9 h-9 rounded-xl flex items-center justify-center',
                      isDark ? 'bg-white/10' : 'bg-gray-100'
                    )}>
                      <Icon className={cn(
                        'w-4 h-4',
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      )} />
                    </div>
                  }
                  showChevron
                  onClick={() => toast.info(`${item.label} 클릭됨`)}
                >
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className={cn(
                      'text-xs',
                      isDark ? 'text-gray-500' : 'text-gray-400'
                    )}>
                      {item.description}
                    </p>
                  </div>
                </ListItem>
              );
            })}
          </div>
        </AppCard>
      </motion.div>

      {/* Logout Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <button
          onClick={() => setShowLogoutModal(true)}
          className={cn(
            'w-full p-4 rounded-2xl flex items-center justify-center gap-2',
            'text-red-500 font-medium transition-colors',
            isDark
              ? 'bg-dark-card hover:bg-red-500/10'
              : 'bg-white shadow-sm hover:bg-red-50'
          )}
        >
          <LogOut className="w-5 h-5" />
          로그아웃
        </button>
      </motion.div>

      {/* Logout Confirm Modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="로그아웃"
        message="정말 로그아웃 하시겠습니까?"
        confirmText="로그아웃"
        variant="danger"
      />
    </div>
  );
}

export default ProfilePage;
