// src/components/schedule/WeeklyScheduleGrid.tsx — бо намуди дарс (Лексия / Амалӣ / Лабораторӣ)
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Clock, User, MapPin } from 'lucide-react';

interface PopulatedLesson {
  time: string;
  subjectId: { name: string };
  teacherId: { fullName: string };
  classroom: string;
  lessonType: "lecture" | "practice" | "lab"; // ← НАВИН!
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
  'bg-blue-100 text-blue-800 border-blue-300',
  'bg-emerald-100 text-emerald-800 border-emerald-300',
  'bg-purple-100 text-purple-800 border-purple-300',
  'bg-amber-100 text-amber-800 border-amber-300',
  'bg-rose-100 text-rose-800 border-rose-300',
  'bg-cyan-100 text-cyan-800 border-cyan-300',
];

const getColor = (name: string) => {
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

// НАВИН: Ранг ва матни намуди дарс
const getLessonTypeBadge = (type: string) => {
  switch (type) {
    case "lecture": return { text: "Лексия", color: "bg-blue-500 text-white" };
    case "practice": return { text: "Амалӣ", color: "bg-emerald-500 text-white" };
    case "lab": return { text: "Лаб.", color: "bg-purple-500 text-white" };
    default: return { text: "—", color: "bg-gray-300 text-gray-600" };
  }
};

export function WeeklyScheduleGrid({
  schedule,
  shift,
  currentDay = 0,
  currentLesson = 1
}: WeeklyScheduleGridProps) {
  const timeSlots = shift === 1 ? timeSlotsShift1 : timeSlotsShift2;

  if (!schedule?.week?.length) {
    return (
      <Card className="p-10 text-center">
        <Clock className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
        <p className="text-muted-foreground">Ҷадвал холист</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-0 shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 bg-muted/50">
              <th className="p-3 text-left font-bold sticky left-0 bg-muted/80 z-10 min-w-32">Вақт</th>
              {weekDaysTg.map((day, i) => (
                <th
                  key={day}
                  className={cn(
                    "p-3 text-center font-bold min-w-28",
                    i === currentDay && "bg-primary/10 text-primary"
                  )}
                >
                  {day}
                  {i === currentDay && <Badge className="ml-1 text-[10px]">имрӯз</Badge>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((time, slotIdx) => (
              <tr key={time} className="border-b hover:bg-muted/20 transition">
                <td className="p-3 font-medium bg-muted/60 sticky left-0 z-10 border-r text-xs">
                  <div className="text-center">
                    <div className="font-bold text-primary">{slotIdx + 1}</div>
                    <div className="text-muted-foreground">{time}</div>
                  </div>
                </td>

                {weekDaysEn.map((dayEn, dayIdx) => {
                  const lesson = schedule.week.find(d => d.day === dayEn)?.lessons?.[slotIdx];
                  const isNow = dayIdx === currentDay && slotIdx + 1 === currentLesson;

                  return (
                    <td
                      key={dayEn + time}
                      className={cn(
                        "p-3 align-top h-28 transition-all",
                        isNow && "ring-2 ring-primary ring-inset bg-primary/5"
                      )}
                    >
                      {lesson?.subjectId ? (
                        <div
                          className={cn(
                            "rounded-lg border p-3 h-full flex flex-col text-xs transition hover:shadow-md",
                            getColor(lesson.subjectId.name),
                            isNow && "ring-2 ring-primary shadow-lg"
                          )}
                        >
                          {/* НАВИН: Намуди дарс */}
                          <div className="mb-2">
                            <Badge className={cn("text-xs font-bold px-2 py-1", getLessonTypeBadge(lesson.lessonType || "lecture").color)}>
                              {getLessonTypeBadge(lesson.lessonType || "lecture").text}
                            </Badge>
                          </div>

                          <div className="font-bold text-base leading-tight">
                            {lesson.subjectId.name}
                          </div>
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />
                              <span className="truncate">{lesson.teacherId?.fullName}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{lesson.classroom || '—'}</span>
                            </div>
                          </div>
                          {isNow && (
                            <Badge className="mt-2 text-[10px] self-start animate-pulse">Ҳозир</Badge>
                          )}
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground/30">
                          {isNow ? "Танаффус" : "—"}
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
    </Card>
  );
}