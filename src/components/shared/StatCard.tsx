import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  delay?: number;
}

const colorClasses = {
  primary: 'from-primary to-accent',
  success: 'from-status-success to-emerald-400',
  warning: 'from-status-warning to-amber-400',
  danger: 'from-status-danger to-rose-400',
  info: 'from-status-info to-sky-400',
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'primary',
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card variant="stat" className="relative overflow-hidden group">
        {/* Gradient Background */}
        <div
          className={cn(
            'absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity',
            `bg-gradient-to-br ${colorClasses[color]}`
          )}
        />
        
        <div className="p-6 relative">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold tracking-tight">{value}</p>
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
              {trend && (
                <p
                  className={cn(
                    'text-xs font-medium flex items-center gap-1',
                    trend.isPositive ? 'text-status-success' : 'text-status-danger'
                  )}
                >
                  <span>{trend.isPositive ? '↑' : '↓'}</span>
                  <span>{Math.abs(trend.value)}%</span>
                  <span className="text-muted-foreground ml-1">vs last week</span>
                </p>
              )}
            </div>
            <div
              className={cn(
                'w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br',
                colorClasses[color]
              )}
            >
              <Icon className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
