import React from 'react';
import { cn } from '@/lib/utils';

interface GradeBadgeProps {
  score: number;
  maxScore?: number;
  showPercentage?: boolean;
}

function getGradeColor(score: number): string {
  if (score >= 90) return 'bg-grade-excellent text-primary-foreground';
  if (score >= 75) return 'bg-grade-good text-primary-foreground';
  if (score >= 60) return 'bg-grade-satisfactory text-primary-foreground';
  return 'bg-grade-poor text-primary-foreground';
}

function getGradeLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Satisfactory';
  return 'Poor';
}

export function GradeBadge({ score, maxScore = 100, showPercentage = false }: GradeBadgeProps) {
  const percentage = Math.round((score / maxScore) * 100);
  const displayValue = showPercentage ? `${percentage}%` : score;

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold',
        getGradeColor(percentage)
      )}
      title={getGradeLabel(percentage)}
    >
      {displayValue}
    </span>
  );
}
