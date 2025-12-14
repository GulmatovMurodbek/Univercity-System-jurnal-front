import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { subjects, semesterWeeks } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface SemesterScheduleGridProps {
  currentWeek?: number;
}

export function SemesterScheduleGrid({ currentWeek = 5 }: SemesterScheduleGridProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card variant="default" className="overflow-hidden">
        <CardHeader className="bg-secondary/30 border-b border-border/50">
          <CardTitle className="text-lg">16-Week Semester Overview</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1400px]">
              <thead>
                <tr className="bg-secondary/50">
                  <th className="p-3 text-left font-semibold text-sm border-b border-border/50 sticky left-0 bg-secondary/50 z-10 min-w-[180px]">
                    Subject
                  </th>
                  {semesterWeeks.map((week) => (
                    <th
                      key={week.weekNumber}
                      className={cn(
                        'p-3 text-center font-semibold text-xs border-b border-border/50 min-w-[70px]',
                        week.weekNumber === currentWeek && 'bg-primary/10'
                      )}
                    >
                      <div>Week {week.weekNumber}</div>
                      <div className="text-[10px] text-muted-foreground font-normal mt-0.5">
                        {week.startDate.slice(5)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject, idx) => (
                  <tr key={subject.id} className="border-b border-border/30">
                    <td className="p-3 sticky left-0 bg-card z-10 border-r border-border/30">
                      <div className="font-medium text-sm">{subject.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {subject.teacherName}
                      </div>
                      <div className="text-xs text-primary mt-0.5">
                        {subject.creditHours} credits • {subject.classroom}
                      </div>
                    </td>
                    {semesterWeeks.map((week) => {
                      const isCurrentWeek = week.weekNumber === currentWeek;
                      const isPastWeek = week.weekNumber < currentWeek;
                      const hours = 4; // hours per week
                      
                      return (
                        <td
                          key={week.weekNumber}
                          className={cn(
                            'p-2 text-center',
                            isCurrentWeek && 'bg-primary/5'
                          )}
                        >
                          <div
                            className={cn(
                              'w-full h-12 rounded-lg flex flex-col items-center justify-center text-xs transition-all',
                              isPastWeek
                                ? 'bg-status-success/20 text-status-success border border-status-success/30'
                                : isCurrentWeek
                                ? 'bg-primary/20 text-primary border border-primary/30 ring-2 ring-primary/30'
                                : 'bg-secondary/50 text-muted-foreground border border-border/30'
                            )}
                          >
                            <span className="font-semibold">{hours}h</span>
                            {isPastWeek && <span className="text-[10px]">✓</span>}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
