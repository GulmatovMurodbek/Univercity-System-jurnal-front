// src/components/schedule/WeeklyScheduleGrid.tsx
// Дизайн: Prod стили + ҳафтаи ҷорӣ (тоқ/ҷуфт) нишондиҳанда
import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Clock, User, MapPin, GraduationCap, Briefcase, Beaker } from 'lucide-react';

// ── Интерфейсҳо ───────────────────────────────────────────────────────────────
interface PopulatedLesson {
  time: string;
  subjectId: { name: string } | null;
  teacherId: { fullName: string } | null;
  classroom: string;
  department: string;
  building: string;
  lessonType: "lecture" | "practice" | "lab";
  weekType?: "all" | "odd" | "even";
}

interface DaySchedule { day: string; lessons: PopulatedLesson[]; }
interface Schedule { week: DaySchedule[]; }

interface WeeklyScheduleGridProps {
  schedule: Schedule | null;
  shift: number;
  currentDay?: number;
  currentLesson?: number;
  currentWeekType?: "odd" | "even";
}

// ── Константаҳо ───────────────────────────────────────────────────────────────
const PAIR_TIMES: Record<number, { s1: string; s2: string }> = {
  1: { s1: "08:00\n09:30", s2: "13:00\n14:30" },
  2: { s1: "09:40\n11:10", s2: "14:40\n16:10" },
  3: { s1: "11:20\n12:50", s2: "16:20\n17:50" },
};
const PAIR_COUNT = 3;
const weekDaysTg = ['Дш', 'Сш', 'Чш', 'Пш', 'Ҷм', 'Шб'];
const weekDaysFull = ['Душанбе', 'Сешанбе', 'Чоршанбе', 'Панҷшанбе', 'Ҷумъа', 'Шанбе'];
const weekDaysEn = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ── Badge навъи дарс ──────────────────────────────────────────────────────────
const getLessonTypeBadge = (type: string) => {
  switch (type) {
    case "lecture": return { text: "ЛЕКСИЯ", color: "bg-blue-100 text-blue-700", icon: GraduationCap };
    case "practice": return { text: "АМАЛӢ", color: "bg-emerald-100 text-emerald-700", icon: Briefcase };
    case "lab": return { text: "ЛАБ.", color: "bg-purple-100 text-purple-700", icon: Beaker };
    default: return { text: "—", color: "bg-gray-100 text-gray-600", icon: GraduationCap };
  }
};

// ── LessonCard ────────────────────────────────────────────────────────────────
const LessonCard = ({
  lesson, isNow, variant = "default", typeLabel, isActiveWeek = false,
}: {
  lesson: PopulatedLesson;
  isNow?: boolean;
  variant?: "default" | "odd" | "even";
  typeLabel?: string;
  isActiveWeek?: boolean;
}) => {
  const badgeInfo = getLessonTypeBadge(lesson.lessonType || "lecture");
  const Icon = badgeInfo.icon;

  const variantStyles = {
    default: "bg-white border-slate-200 hover:shadow-lg",
    odd: isActiveWeek
      ? "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400/30 shadow-md"
      : "bg-emerald-50/40 border-emerald-200/50 opacity-60 hover:opacity-100",
    even: isActiveWeek
      ? "bg-blue-50 border-blue-300 ring-2 ring-blue-400/30 shadow-md"
      : "bg-blue-50/40 border-blue-200/50 opacity-60 hover:opacity-100",
  };

  return (
    <div className={cn(
      "rounded-xl border p-3 h-full flex flex-col shadow-sm text-left transition-all duration-200 relative overflow-hidden group",
      variantStyles[variant],
      isNow && "ring-2 ring-primary/60 border-primary shadow-xl bg-primary/5 scale-[1.01]"
    )}>
      {/* Диагональ индикатор */}
      {variant !== "default" && (
        <div className={cn(
          "absolute top-0 right-0 w-14 h-14 -mr-7 -mt-7 rotate-45 transform",
          variant === "odd" ? "bg-emerald-400 opacity-15" : "bg-blue-400 opacity-15"
        )} />
      )}

      {/* Сатри badge */}
      <div className="flex justify-between items-start mb-2 relative z-10">
        <Badge
          variant="outline"
          className={cn("text-[9px] px-2 h-5 border-none font-bold flex items-center gap-1 tracking-wide", badgeInfo.color)}
        >
          <Icon className="w-3.5 h-3.5" />
          {badgeInfo.text}
        </Badge>
        <div className="flex items-center gap-1.5">
          {typeLabel && (
            <span className={cn(
              "text-[8px] font-bold px-1.5 py-0.5 rounded-full tracking-wide",
              variant === "odd"
                ? "bg-emerald-200 text-emerald-800"
                : "bg-blue-200 text-blue-800"
            )}>
              {typeLabel}
            </span>
          )}
          {isNow && (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
            </span>
          )}
        </div>
      </div>

      {/* Фан номи */}
      <div
        className="font-bold text-[13px] leading-snug mb-2 line-clamp-2 text-slate-800"
        title={lesson.subjectId?.name}
      >
        {lesson.subjectId?.name}
      </div>

      {/* Маълумоти иловагӣ */}
      <div className="mt-auto space-y-1.5 pt-2 border-t border-black/5 relative z-10">
        {lesson.teacherId?.fullName && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-700 font-medium bg-white/70 p-1.5 rounded-lg">
            <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">{lesson.teacherId.fullName}</span>
          </div>
        )}
        {(lesson.classroom || lesson.building) && (
          <div className="flex items-center justify-between gap-1.5 text-[10px] text-slate-500 px-1">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
              <span className="truncate">
                {lesson.classroom}{lesson.building ? ` (${lesson.building})` : ""}
              </span>
            </div>
            {isActiveWeek && variant !== "default" && (
              <span className="text-[8px] font-black bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full shadow-sm animate-pulse shrink-0">
                ҲОЗИР
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Grid тип ──────────────────────────────────────────────────────────────────
type GridCell = { odd?: PopulatedLesson; even?: PopulatedLesson; both?: PopulatedLesson };

// ── Ҳисоби ҳафтаи тоқ/ҷуфт ──────────────────────────────────────────────────
function getCurrentWeekType(): "odd" | "even" {
  const now = new Date();
  // Моҳи Сентябр (8) = оғози соли таҳсил
  const yearStart = new Date(now.getFullYear(), 8, 1); // 1 Сентябр
  if (now < yearStart) yearStart.setFullYear(yearStart.getFullYear() - 1);
  const diffMs = now.getTime() - yearStart.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  const weekNum = Math.floor(diffDays / 7) + 1;
  return weekNum % 2 === 0 ? "odd" : "even";
}

// ── АСОСӢ ─────────────────────────────────────────────────────────────────────
export const WeeklyScheduleGrid = React.memo(({
  schedule, shift, currentDay = 0, currentLesson = 1, currentWeekType,
}: WeeklyScheduleGridProps) => {

  const weekType = currentWeekType || getCurrentWeekType();

  const grid = useMemo(() => {
    const g: Record<number, Record<number, GridCell>> = {};
    for (let d = 0; d < 6; d++) {
      g[d] = {};
      for (let p = 1; p <= PAIR_COUNT; p++) g[d][p] = {};
    }
    if (!schedule?.week) return g;

    schedule.week.forEach(dayData => {
      const dayIdx = weekDaysEn.indexOf(dayData.day);
      if (dayIdx === -1) return;
      let pairNum = 1;
      let i = 0;
      const lessons = dayData.lessons || [];

      while (i < lessons.length && pairNum <= PAIR_COUNT) {
        const l = lessons[i];
        if (!l || !l.subjectId) { i++; pairNum++; continue; }

        if (l.weekType === "odd") {
          g[dayIdx][pairNum].odd = l;
          const next = lessons[i + 1];
          if (next && next.weekType === "even" && next.subjectId) {
            g[dayIdx][pairNum].even = next;
            i += 2;
          } else { i++; }
          pairNum++;
        } else if (l.weekType === "even") {
          g[dayIdx][pairNum].even = l;
          i++; pairNum++;
        } else {
          g[dayIdx][pairNum].both = l;
          i++; pairNum++;
        }
      }
    });
    return g;
  }, [schedule]);

  if (!schedule?.week?.length) {
    return (
      <Card className="p-20 text-center border-dashed border-2 bg-gradient-to-b from-slate-50 to-white">
        <div className="bg-white p-5 rounded-full inline-block mb-6 shadow-md border">
          <Clock className="w-10 h-10 text-primary/30" />
        </div>
        <h4 className="text-xl font-bold text-slate-600 mb-2">Ҷадвал ёфт нашуд</h4>
        <p className="text-sm text-muted-foreground">Барои ин гурӯҳ ҷадвал ҳанӯз тартиб дода нашудааст</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Ҳафтаи ҷорӣ индикатор */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-bold text-sm transition-all shadow-sm",
            weekType === "odd"
              ? "bg-emerald-50 border-emerald-400 text-emerald-700"
              : "bg-blue-50 border-blue-400 text-blue-700"
          )}>
            <span className="relative flex h-3 w-3">
              <span className={cn(
                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-60",
                weekType === "odd" ? "bg-emerald-400" : "bg-blue-400"
              )} />
              <span className={cn(
                "relative inline-flex rounded-full h-3 w-3",
                weekType === "odd" ? "bg-emerald-500" : "bg-blue-500"
              )} />
            </span>
            Ҳафтаи ҷорӣ: {weekType === "odd" ? "ТОҚ" : "ҶУФТ"}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" />
            <span>Тоқ</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <div className="w-3 h-3 rounded bg-blue-100 border border-blue-300" />
            <span>Ҷуфт</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <div className="w-3 h-3 rounded bg-white border border-slate-300" />
            <span>Ҳар ҳафта</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <Card className="overflow-hidden border shadow-md rounded-2xl bg-white ring-1 ring-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse table-fixed min-w-[1100px]">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100/80 border-b-2 border-slate-200">
                <th className="p-4 text-left font-bold text-slate-700 sticky left-0 bg-slate-50/95 backdrop-blur-sm z-20 w-24 border-r-2 border-slate-200 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.08)]">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary/50" />
                    <span>Вақт</span>
                  </div>
                </th>
                {weekDaysTg.map((day, i) => (
                  <th
                    key={day}
                    className={cn(
                      "p-3 text-center relative transition-all",
                      i === currentDay
                        ? "text-primary bg-primary/5 font-bold"
                        : "text-slate-600 font-semibold hover:bg-slate-100/50"
                    )}
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-xs font-bold uppercase tracking-wider">{day}</span>
                      <span className="text-[9px] text-muted-foreground font-normal">{weekDaysFull[i]}</span>
                    </div>
                    {i === currentDay && (
                      <div className="absolute bottom-0 left-2 right-2 h-[3px] rounded-full bg-primary" />
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: PAIR_COUNT }, (_, i) => i + 1).map(pair => {
                const timeStr = PAIR_TIMES[pair][shift === 1 ? "s1" : "s2"];
                const isCurrentPair = pair === currentLesson;

                return (
                  <tr
                    key={pair}
                    className={cn(
                      "border-b last:border-0 transition-colors",
                      isCurrentPair ? "bg-primary/[0.02]" : "hover:bg-slate-50/50"
                    )}
                  >
                    {/* Вақт ячейка */}
                    <td className="p-3 font-medium bg-slate-50/60 sticky left-0 z-10 border-r-2 border-slate-200 align-middle shadow-[4px_0_12px_-4px_rgba(0,0,0,0.08)]">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-inner transition-colors",
                          isCurrentPair
                            ? "bg-primary text-white shadow-primary/30"
                            : "bg-slate-200 text-slate-600"
                        )}>
                          {pair}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono text-center leading-tight whitespace-pre-line font-semibold">
                          {timeStr}
                        </span>
                      </div>
                    </td>

                    {/* Рӯзҳо */}
                    {[0, 1, 2, 3, 4, 5].map(dayIdx => {
                      const cell = grid[dayIdx]?.[pair] || {};
                      const isNow = dayIdx === currentDay && isCurrentPair;
                      const hasBoth = !!cell.both;
                      const hasOdd = !!cell.odd;
                      const hasEven = !!cell.even;
                      const isEmpty = !hasBoth && !hasOdd && !hasEven;

                      return (
                        <td
                          key={dayIdx}
                          className={cn(
                            "p-2.5 align-top border-r border-slate-100 last:border-r-0 transition-all duration-300",
                            isNow ? "bg-primary/[0.03]" : "",
                            dayIdx === currentDay ? "bg-primary/[0.01]" : ""
                          )}
                          style={{ minHeight: "220px" }}
                        >
                          {isEmpty ? (
                            <div className="h-full rounded-xl border-2 border-dashed border-slate-200/80 bg-slate-50/30 flex items-center justify-center hover:border-slate-300 transition-all">
                              <span className="text-slate-300 text-sm font-medium select-none">—</span>
                            </div>
                          ) : hasBoth ? (
                            <LessonCard
                              lesson={cell.both!}
                              isNow={isNow}
                              variant="default"
                            />
                          ) : (
                            <div className="flex flex-col gap-2 h-full">
                              {/* ТОҚ */}
                              {hasOdd ? (
                                <div className="flex-1 min-h-0">
                                  <LessonCard
                                    lesson={cell.odd!}
                                    isNow={isNow}
                                    variant="odd"
                                    typeLabel="ТОҚ"
                                    isActiveWeek={weekType === "odd"}
                                  />
                                </div>
                              ) : (
                                <div className={cn(
                                  "flex-1 border-2 border-dashed rounded-xl flex items-center justify-center transition-colors",
                                  weekType === "odd" ? "bg-emerald-50/40 border-emerald-200" : "bg-emerald-50/10 border-emerald-200/40"
                                )}>
                                  <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-300">Тоқ холӣ</span>
                                </div>
                              )}
                              {/* ҶУФТ */}
                              {hasEven ? (
                                <div className="flex-1 min-h-0">
                                  <LessonCard
                                    lesson={cell.even!}
                                    isNow={isNow}
                                    variant="even"
                                    typeLabel="ҶУФТ"
                                    isActiveWeek={weekType === "even"}
                                  />
                                </div>
                              ) : (
                                <div className={cn(
                                  "flex-1 border-2 border-dashed rounded-xl flex items-center justify-center transition-colors",
                                  weekType === "even" ? "bg-blue-50/40 border-blue-200" : "bg-blue-50/10 border-blue-200/40"
                                )}>
                                  <span className="text-[9px] font-bold uppercase tracking-widest text-blue-300">Ҷуфт холӣ</span>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
});

WeeklyScheduleGrid.displayName = "WeeklyScheduleGrid";
