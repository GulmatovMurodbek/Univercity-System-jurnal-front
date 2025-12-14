import React from 'react';
import { cn } from '@/lib/utils';
import { AttendanceStatus } from '@/types';

interface AttendanceBadgeProps {
  status: AttendanceStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const statusConfig: Record<
  AttendanceStatus,
  { label: string; shortLabel: string; className: string }
> = {
  present: {
    label: 'Present (Ҳаст)',
    shortLabel: 'H',
    className: 'bg-attendance-present text-primary-foreground',
  },
  absent: {
    label: 'Absent (Нест)',
    shortLabel: 'N',
    className: 'bg-attendance-absent text-primary-foreground',
  },
  late: {
    label: 'Late',
    shortLabel: 'L',
    className: 'bg-attendance-late text-primary-foreground',
  },
  excused: {
    label: 'Excused',
    shortLabel: 'E',
    className: 'bg-attendance-excused text-primary-foreground',
  },
};

const sizeClasses = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-base',
};

export function AttendanceBadge({
  status,
  size = 'md',
  showLabel = false,
}: AttendanceBadgeProps) {
  const config = statusConfig[status];

  if (showLabel) {
    return (
      <span
        className={cn(
          'inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium',
          config.className
        )}
      >
        {config.label}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-bold',
        sizeClasses[size],
        config.className
      )}
      title={config.label}
    >
      {config.shortLabel}
    </span>
  );
}
