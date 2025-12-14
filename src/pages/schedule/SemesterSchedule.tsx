import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { SemesterScheduleGrid } from '@/components/schedule/SemesterScheduleGrid';

export default function SemesterSchedule() {
  return (
    <DashboardLayout>
      <PageHeader
        title="16-Week Semester Overview"
        description="Complete semester schedule with all 8 subjects across 16 weeks"
      />
      <SemesterScheduleGrid currentWeek={5} />
    </DashboardLayout>
  );
}
