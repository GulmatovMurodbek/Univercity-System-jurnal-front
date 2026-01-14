// src/components/schedule/WeeklyScheduleGrid.tsx — бо намуди дарс (Лексия / Амалӣ / Лабораторӣ)
import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Clock, User, MapPin, Building2, School, DoorOpen } from 'lucide-react';

interface PopulatedLesson {
  time: string;
  subjectId: { name: string };
  teacherId: { fullName: string };
  classroom: string;
  department: string;
  building: string;
  lessonType: "lecture" | "practice" | "lab";
}

interface DaySchedule {
  day: string;
  lessons: PopulatedLesson[];
}

interface Schedule {
  week: DaySchedule[];
}

interface WeeklyScheduleGridProps {
  schedule: Schedule | null;
  shift: number;
  currentDay?: number;
  currentLesson?: number;
}

const timeSlotsShift1 = ['08:00-08:50', '09:00-09:50', '10:00-10:50', '11:00-11:50', '12:00-12:50', '13:00-13:50'];
const timeSlotsShift2 = ['13:00-13:50', '14:00-14:50', '15:00-15:50', '16:00-16:50', '17:00-17:50', '18:00-18:50'];

const weekDaysTg = ['Дш', 'Сш', 'Чш', 'Пш', 'Ҷм', 'Шб'];
const weekDaysEn = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const colors = [
  'bg-slate-50 text-slate-900 border-slate-200',
  'bg-indigo-50 text-indigo-900 border-indigo-100',
  'bg-emerald-50 text-emerald-900 border-emerald-100',
  'bg-amber-50 text-amber-900 border-amber-100',
  'bg-rose-50 text-rose-900 border-rose-100',
  'bg-cyan-50 text-cyan-900 border-cyan-100',
];

const getColor = (name: string) => {
  if (!name) return colors[0];
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const getLessonTypeBadge = (type: string) => {
  switch (type) {
    case "lecture": return { text: "Лексия", color: "bg-blue-100 text-blue-700 border-blue-200" };
    case "practice": return { text: "Амалӣ", color: "bg-emerald-100 text-emerald-700 border-emerald-200" };
    case "lab": return { text: "Лаб.", color: "bg-purple-100 text-purple-700 border-purple-200" };
    default: return { text: "—", color: "bg-gray-100 text-gray-600 border-gray-200" };
  }
};

export const WeeklyScheduleGrid = React.memo(({
  schedule,
  shift,
  currentDay = 0,
  currentLesson = 1
}: WeeklyScheduleGridProps) => {
  const timeSlots = shift === 1 ? timeSlotsShift1 : timeSlotsShift2;

  const lessonsGrid = useMemo(() => {
    if (!schedule?.week) return [];
    const grid: any[][] = Array(6).fill(null).map(() => Array(6).fill(null));
    schedule.week.forEach((dayData) => {
      const dayIdx = weekDaysEn.indexOf(dayData.day);
      if (dayIdx !== -1) {
        dayData.lessons.forEach((lesson, slotIdx) => {
          if (slotIdx < 6) grid[slotIdx][dayIdx] = lesson;
        });
      }
    });
    return grid;
  }, [schedule]);

  if (!schedule?.week?.length) {
    return (
      <Card className="p-16 text-center border-dashed border-2">
        <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
        <h4 className="text-xl font-medium text-muted-foreground">Ҷадвал холист</h4>
        <p className="text-sm text-muted-foreground/60 mt-2">Барои ин гурӯҳ ҳанӯз ҷадвал тартиб дода нашудааст.</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border shadow-sm rounded-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50/80 backdrop-blur-sm border-b">
              <th className="p-4 text-left font-semibold sticky left-0 bg-slate-50 z-20 w-32 border-r">Вақт</th>
              {weekDaysTg.map((day, i) => (
                <th
                  key={day}
                  className={cn(
                    "p-4 text-center font-semibold min-w-[160px] relative",
                    i === currentDay && "text-primary"
                  )}
                >
                  {day}
                  {i === currentDay && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((time, slotIdx) => (
              <tr key={time} className="group border-b last:border-0">
                <td className="p-4 font-medium bg-slate-50/50 sticky left-0 z-10 border-r transition-colors group-hover:bg-slate-100/80">
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-slate-400 mb-1">{slotIdx + 1}</span>
                    <span className="text-[11px] font-semibold text-slate-600">{time}</span>
                  </div>
                </td>

                {[0, 1, 2, 3, 4, 5].map((dayIdx) => {
                  const lesson = lessonsGrid[slotIdx]?.[dayIdx];
                  const isNow = dayIdx === currentDay && slotIdx + 1 === currentLesson;

                  return (
                    <td
                      key={dayIdx + time}
                      className={cn(
                        "p-2 align-top h-auto min-h-[14rem] transition-colors",
                        isNow && "bg-primary/[0.03]"
                      )}
                    >
                      {lesson?.subjectId ? (
                        <div
                          className={cn(
                            "rounded-xl border p-3 h-full flex flex-col shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5",
                            getColor(lesson.subjectId.name),
                            isNow && "ring-1 ring-primary/30 border-primary/20"
                          )}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] uppercase tracking-wider font-bold border-none",
                                getLessonTypeBadge(lesson.lessonType || "lecture").color
                              )}
                            >
                              {getLessonTypeBadge(lesson.lessonType || "lecture").text}
                            </Badge>
                            {isNow && (
                              <div className="flex items-center gap-1.5">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                </span>
                                <span className="text-[10px] font-bold text-primary uppercase">Ҳозир</span>
                              </div>
                            )}
                          </div>

                          <div className="font-bold text-sm leading-snug mb-3 line-clamp-2 min-h-[2.5rem]">
                            {lesson.subjectId.name}
                          </div>

                          <div className="mt-auto pt-2 border-t border-black/5 space-y-1.5">
                            <div className="flex items-center gap-2 text-[11px] opacity-80 font-medium text-slate-700">
                              <User className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                              <span className="truncate">{lesson.teacherId?.fullName}</span>
                            </div>

                            <div className="flex flex-col gap-1.5 pt-1">
                              {/* Classroom */}
                              <div className="flex items-center gap-2 text-[11px] font-medium text-slate-600">
                                <DoorOpen className="w-3.5 h-3.5 flex-shrink-0 text-indigo-500" />
                                <span>Аудитория: {lesson.classroom || '—'}</span>
                              </div>

                              {/* Building */}
                              {lesson.building && (
                                <div className="flex items-center gap-2 text-[11px] font-medium text-slate-600">
                                  <Building2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-500" />
                                  <span className="truncate">{lesson.building}</span>
                                </div>
                              )}

                              {/* Department */}
                              {lesson.department && (
                                <div className="flex items-center gap-2 text-[11px] font-medium text-slate-600">
                                  <School className="w-3.5 h-3.5 flex-shrink-0 text-amber-500" />
                                  <span className="truncate line-clamp-1" title={lesson.department}>
                                    {lesson.department}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <span className="text-[10px] font-medium text-slate-300 uppercase tracking-widest">
                            {isNow ? "Танаффус" : "—"}
                          </span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card >
  );
});

WeeklyScheduleGrid.displayName = "WeeklyScheduleGrid";
