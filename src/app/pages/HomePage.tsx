/**
 * HomePage - Example home page
 */

import { motion } from 'framer-motion';
import { Zap, TrendingUp, Star, ArrowRight } from 'lucide-react';
import { useTheme } from '../../packages/theme';
import { AppCard, Button, Badge, ListItem } from '../../packages/ui';
import { cn } from '../../packages/utils';

export function HomePage() {
  const { isDark } = useTheme();

  // Sample data
  const stats = [
    { label: '포인트', value: 2500, icon: Star, color: 'amber' },
    { label: '수익률', value: '+12.5%', icon: TrendingUp, color: 'emerald' },
    { label: '거래', value: 48, icon: Zap, color: 'blue' },
  ];

  const recentItems = [
    { id: 1, title: '신규 기능 업데이트', description: '더 빠른 거래가 가능합니다', time: '2시간 전' },
    { id: 2, title: '포인트 적립 완료', description: '+500P 적립되었습니다', time: '5시간 전' },
    { id: 3, title: '이벤트 당첨', description: '축하합니다! 경품에 당첨되었습니다', time: '1일 전' },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h1 className="text-2xl font-bold">안녕하세요 👋</h1>
        <p className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-500')}>
          오늘도 좋은 하루 되세요!
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-3"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <AppCard key={index} className="p-4">
              <div className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center mb-2',
                stat.color === 'amber' && 'bg-amber-500/20',
                stat.color === 'emerald' && 'bg-emerald-500/20',
                stat.color === 'blue' && 'bg-blue-500/20'
              )}>
                <Icon className={cn(
                  'w-4 h-4',
                  stat.color === 'amber' && 'text-amber-500',
                  stat.color === 'emerald' && 'text-emerald-500',
                  stat.color === 'blue' && 'text-blue-500'
                )} />
              </div>
              <p className={cn('text-xs', isDark ? 'text-gray-400' : 'text-gray-500')}>
                {stat.label}
              </p>
              <p className="text-lg font-bold">{stat.value}</p>
            </AppCard>
          );
        })}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <AppCard padding="none">
          <div className="p-4 border-b border-gray-100 dark:border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">빠른 실행</h2>
              <Badge variant="primary" size="sm">NEW</Badge>
            </div>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            <Button variant="primary" fullWidth icon={<Zap className="w-4 h-4" />}>
              거래하기
            </Button>
            <Button variant="secondary" fullWidth icon={<TrendingUp className="w-4 h-4" />}>
              분석보기
            </Button>
          </div>
        </AppCard>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <AppCard padding="none">
          <div className="p-4 border-b border-gray-100 dark:border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">최근 활동</h2>
              <button className="text-sm text-primary-500 font-medium flex items-center gap-1">
                전체보기 <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-white/10">
            {recentItems.map((item) => (
              <ListItem
                key={item.id}
                showChevron
                onClick={() => console.log('Clicked:', item.id)}
              >
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className={cn(
                    'text-xs',
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  )}>
                    {item.description}
                  </p>
                </div>
                <span className={cn(
                  'text-xs',
                  isDark ? 'text-gray-500' : 'text-gray-400'
                )}>
                  {item.time}
                </span>
              </ListItem>
            ))}
          </div>
        </AppCard>
      </motion.div>
    </div>
  );
}

export default HomePage;
