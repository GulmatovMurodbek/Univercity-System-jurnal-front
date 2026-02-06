// src/pages/admin/AdminWeeklyGradePage.tsx
import React, { useState, useEffect, useMemo, memo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import axios from "axios";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// --- TYPES ---
interface GradeRecord {
  attendance: "present" | "absent" | "late" | null;
  preparationGrade: number | null;
  taskGrade: number | null;
  subjectId?: string;
  subjectName?: string;
  lessonType?: "lecture" | "practice" | "lab";
}

interface DayGrades {
  date: string;
  weekday: string;
  lessons: GradeRecord[];
  weekNumber?: number;
}

interface Student {
  _id: string;
  fullName: string;
  grades: DayGrades[];
}

interface Subject {
  _id: string;
  name: string;
}

interface GradebookData {
  groupName: string;
  students: Student[];
  subjects: Subject[];
  weeklyLessonCounts?: Record<string, Record<number, number>>;
}

interface Group {
  _id: string;
  name: string;
  course: number;
}

// --- HELPER FUNCTIONS ---
const getGradeStyle = (grade: number) => {
  if (grade === 0) return "bg-gray-200 text-gray-600";
  if (grade >= 4.5) return "bg-emerald-500 text-white shadow-lg";
  if (grade >= 3.5) return "bg-blue-500 text-white shadow-lg";
  if (grade >= 3) return "bg-amber-500 text-white shadow-lg";
  return "bg-rose-500 text-white shadow-lg";
};

const getAverageStyle = (avg: number) => {
  if (avg < 2.5) return "bg-rose-100 text-rose-600";
  if (avg <= 3.0) return "bg-amber-100 text-amber-600";
  if (avg <= 4.0) return "bg-emerald-100 text-emerald-600";
  return "bg-green-100 text-green-800";
};

const getGradient = (grade: number) => {
  if (grade === 0) return "bg-gradient-to-r from-gray-200 to-gray-300";
  if (grade >= 4.5) return "bg-gradient-to-r from-emerald-400 to-green-500";
  if (grade >= 3.5) return "bg-gradient-to-r from-blue-400 to-indigo-500";
  if (grade >= 3) return "bg-gradient-to-r from-amber-300 to-orange-400";
  return "bg-gradient-to-r from-rose-400 to-red-500";
};

const getShadow = (grade: number) => {
  if (grade >= 4.5) return "shadow-emerald-500/20";
  if (grade >= 3.5) return "shadow-blue-500/20";
  if (grade >= 3) return "shadow-amber-500/20";
  if (grade > 0) return "shadow-rose-500/20";
  return "shadow-gray-200/50";
};

const getInitials = (name: string) => {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
};

// --- COMPONENTS ---

// 1. Memoized Student Card
const StudentCard = memo(({ data, onClick }: { data: any, onClick: (s: any) => void }) => {
  // Colors based on Total Score (max 200, or 100 per block)
  // Let's assume >80% is green.
  const percentage = (data.totalAvg / (data.block2Score > 0 ? 200 : 100)) * 100; // Rough valid estimate if block 2 exists

  // Use a simple heuristic: 
  // Excellent: > 180 (or >90 in block)
  // Good: > 140
  // Pass: > 100
  // Fail: < 100
  // However, `data.totalAvg` might be small if semester just started.
  // Let's stick to styling based on accumulated value? Or keep generic color.
  // I'll update `getGradient` call to custom logic or update helper.
  // Let's use blue for generic safe.

  const initials = useMemo(() => getInitials(data.fullName), [data.fullName]);

  return (
    <div
      className={cn(
        "group relative bg-card rounded-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer shadow-lg hover:shadow-2xl shadow-indigo-500/10"
      )}
      onClick={() => onClick(data)}
    >
      {/* Header - Show Block Scores */}
      <div className="h-24 w-full rounded-t-2xl relative overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mixed-blend-overlay" />
        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white font-bold px-3 py-1 rounded-lg border border-white/20 shadow-sm text-sm">
          Total: {data.totalAvg.toFixed(1)}
        </div>
        <div className="absolute bottom-2 left-4 text-white/90 text-sm font-medium flex gap-3">
          <span>B1: {data.block1Score}</span>
          <span>B2: {data.block2Score}</span>
        </div>
      </div>

      {/* Avatar */}
      <div className="absolute top-12 left-6">
        <Avatar className="h-20 w-20 border-4 border-card shadow-lg ring-2 ring-white/50">
          <AvatarFallback className={cn("text-2xl font-bold bg-muted text-foreground")}>
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Body */}
      <div className="pt-12 p-6">
        <div className="mb-6">
          <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
            {data.fullName}
          </h3>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">Донишҷӯ</p>
        </div>

        {/* Chart - weekly scores 0-12.5 */}
        <div className="space-y-2">
          <div className="flex items-end justify-between h-12 gap-[3px] px-1">
            {data.weeklyAverages.map((score: number, idx: number) => {
              // Max score 12.5
              const height = score > 0 ? Math.max((score / 12.5) * 100, 10) : 5;
              const barColor = score === 0 ? "bg-muted" :
                score >= 11 ? "bg-emerald-400" :
                  score >= 8 ? "bg-blue-400" :
                    score >= 6 ? "bg-amber-400" : "bg-rose-400";
              return (
                <div
                  key={idx}
                  title={`Week ${idx + 1}: ${score}`}
                  className={cn("w-full rounded-t-sm opacity-80 transition-all group-hover:opacity-100", barColor)}
                  style={{ height: `${height}%` }}
                />
              )
            })}
          </div>
          <div className="h-[2px] w-full bg-muted rounded-full" />
        </div>
      </div>
    </div>
  );
});

// 2. Weekly Breakdown Component (Detailed Row)
const WeeklyBreakdown = memo(({ weekNum, student, subjectId }: { weekNum: number, student: any, subjectId: string }) => {
  // Logic to calculate specific breakdown values
  const weekDays = student.gradesRaw?.filter((d: any) => d.weekNumber === weekNum) || [];
  const relevantLessons: any[] = [];

  weekDays.forEach((day: any) => {
    day.lessons.forEach((l: any) => {
      if (String(l.subjectId) === String(subjectId)) {
        relevantLessons.push({ ...l, date: day.date, weekday: day.weekday });
      }
    });
  });

  const totalLessons = relevantLessons.length;
  if (totalLessons === 0) {
    return (
      <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/5 text-muted-foreground mb-4">
        <span className="font-semibold">Ҳафтаи {weekNum}</span>
        <span className="text-sm italic">Дарс набуд</span>
      </div>
    );
  }

  // 1. Attendance
  const attendedCount = relevantLessons.filter(l => l.attendance === 'present').length;
  const attendanceScore = (attendedCount / totalLessons) * 5;

  // 2. Preparation
  const sumPrep = relevantLessons.reduce((acc, l) => acc + (l.preparationGrade || 0), 0);
  const avgPrep = sumPrep / totalLessons;
  const preparationScore = (avgPrep / 5) * 2.5;

  // 3. Assignment (Practical/Lab only)
  const practicalLessons = relevantLessons.filter(l => l.lessonType === 'practice' || l.lessonType === 'lab');
  const assignCount = practicalLessons.length;
  let assignmentScore = 0;
  let avgAssign = 0;
  if (assignCount > 0) {
    const sumAssign = practicalLessons.reduce((acc, l) => acc + (l.taskGrade || 0), 0);
    avgAssign = sumAssign / assignCount;
    assignmentScore = (avgAssign / 5) * 5;
  }

  const weeklyTotal = attendanceScore + preparationScore + assignmentScore;

  const getLessonTypeLabel = (type: string) => {
    switch (type) {
      case 'lecture': return 'Lec';
      case 'practice': return 'Pra';
      case 'lab': return 'Lab';
      case 'seminar': return 'Sem';
      case 'exam': return 'Exam';
      default: return 'Unk';
    }
  };

  const getLessonTypeColor = (type: string) => {
    switch (type) {
      case 'lecture': return 'text-blue-500 bg-blue-50 border-blue-100';
      case 'practice': return 'text-orange-500 bg-orange-50 border-orange-100';
      case 'lab': return 'text-purple-500 bg-purple-50 border-purple-100';
      default: return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="border rounded-xl overflow-hidden bg-white mb-4 shadow-sm hover:shadow-md transition-all">
      {/* Header */}
      <div className="bg-slate-50 p-4 border-b flex justify-between items-center">
        <h3 className="font-bold text-lg text-slate-800">Ҳафтаи {weekNum}</h3>
        <div className="flex items-center gap-3">
          <div className="hidden md:block text-xs text-muted-foreground mr-2 font-mono bg-slate-100 px-2 py-1 rounded">
            {attendanceScore.toFixed(2)} + {preparationScore.toFixed(2)} + {assignmentScore.toFixed(2)}
          </div>
          <Badge className={cn("text-base px-3 py-1",
            weeklyTotal >= 11 ? "bg-emerald-500 hover:bg-emerald-600" :
              weeklyTotal >= 8 ? "bg-blue-500 hover:bg-blue-600" :
                weeklyTotal >= 6 ? "bg-amber-500 hover:bg-amber-600" : "bg-rose-500 hover:bg-rose-600"
          )}>
            Total: {weeklyTotal.toFixed(2)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        {/* Attendance Column */}
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-dashed">
            <div className="p-1.5 rounded-md bg-blue-100 text-blue-700">
              <BookOpen className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-sm">Attendance (Max 5)</h4>
          </div>

          <div className="space-y-2">
            {relevantLessons.map((l, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm p-2 rounded bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase w-10 text-center", getLessonTypeColor(l.lessonType))}>
                    {getLessonTypeLabel(l.lessonType)}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{l.date}</span>
                </div>
                <Badge variant="outline" className={cn("border-0 font-medium", l.attendance === 'present' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700")}>
                  {l.attendance === 'present' ? "Present" : "Absent"}
                </Badge>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-dashed">
            <p className="text-xs text-slate-500 text-center font-mono bg-slate-50 p-2 rounded">
              {attendedCount} attended out of {totalLessons} lessons<br />
              ({attendedCount} ÷ {totalLessons}) × 5 = <span className="font-bold text-foreground">{attendanceScore.toFixed(2)}</span>
            </p>
          </div>
        </div>

        {/* Preparation Column */}
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-dashed">
            <div className="p-1.5 rounded-md bg-purple-100 text-purple-700">
              <BookOpen className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-sm">Preparation (Max 2.5)</h4>
          </div>

          <div className="space-y-2">
            {relevantLessons.map((l, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm p-2 rounded bg-slate-50 border border-slate-100">
                <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase w-10 text-center", getLessonTypeColor(l.lessonType))}>
                  {getLessonTypeLabel(l.lessonType)}
                </span>
                <Badge variant="secondary" className="bg-white border shadow-sm font-mono">{l.preparationGrade || 0}</Badge>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-dashed text-center">
            <div className="bg-slate-50 p-2 rounded">
              <p className="text-xs text-slate-500 font-mono mb-1">
                Average of lesson preparation grades
              </p>
              <p className="text-xs text-slate-500 font-mono">
                ({avgPrep.toFixed(2)} / 5) × 2.5 = <span className="font-bold text-foreground">{preparationScore.toFixed(2)}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Assignment Column */}
        <div className="p-4 space-y-3 bg-orange-50/30">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-dashed">
            <div className="p-1.5 rounded-md bg-orange-100 text-orange-700">
              <BookOpen className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-sm">Assignment (Max 5)</h4>
          </div>

          <div className="space-y-2 min-h-[40px]">
            {practicalLessons.length > 0 ? practicalLessons.map((l, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm p-2 rounded bg-white border border-orange-100 shadow-sm">
                <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase w-10 text-center", getLessonTypeColor(l.lessonType))}>
                  {getLessonTypeLabel(l.lessonType)}
                </span>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200 font-mono">
                  {l.taskGrade || 0}
                </Badge>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-4 text-slate-400">
                <span className="text-xs italic">Only Practical/Lab</span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-dashed text-center">
            <div className="bg-white/50 p-2 rounded">
              {practicalLessons.length > 0 ? (
                <>
                  <p className="text-xs text-slate-500 font-mono mb-1">
                    Average of assignment grades
                  </p>
                  <p className="text-xs text-slate-500 font-mono">
                    ({avgAssign.toFixed(2)} / 5) × 5 = <span className="font-bold text-foreground">{assignmentScore.toFixed(2)}</span>
                  </p>
                </>
              ) : (
                <p className="text-xs text-slate-500 font-mono">N/A = 0</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// 2. Memoized Student Modal
const StudentModal = memo(({ student, subjectName, subjectId, onClose }: { student: any, subjectName: string, subjectId: string | undefined, onClose: () => void }) => {
  if (!student) return null;

  const initials = getInitials(student.fullName);

  return (
    <Dialog open={!!student} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl overflow-hidden p-0 border-0 shadow-2xl bg-card/95 backdrop-blur-xl">
        <DialogHeader className="p-6 pb-2 border-b bg-muted/10 hidden">
          <DialogTitle>{student.fullName}</DialogTitle>
        </DialogHeader>

        {/* Modal Header */}
        <div className="bg-muted/30 border-b p-8 pb-12">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
            <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
              <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Badge variant="outline" className="bg-background/50 backdrop-blur border-primary/20 text-primary mb-2 mx-auto md:mx-0 w-fit">
                Профили донишҷӯ
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight">
                {student.fullName}
              </h2>
              <p className="text-lg text-muted-foreground font-medium">
                {subjectName}
              </p>
            </div>
          </div>
        </div>

        {/* Stat Cards - Blocks */}
        <div className="-mt-8 px-8 grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {[
            { label: "Блоки 1 (Ҳаф 1-8)", value: student.block1Score + " / 100", color: "bg-blue-500" },
            { label: "Блоки 2 (Ҳаф 9-16)", value: student.block2Score + " / 100", color: "bg-purple-500" },
            { label: "Ҷамъ", value: student.totalAvg.toFixed(2), color: "bg-emerald-500" },
          ].map((stat, i) => (
            <div key={i} className="bg-card border rounded-xl p-4 shadow-lg flex items-center justify-between group hover:border-primary/50 transition-colors">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">{stat.label}</p>
                <h4 className="text-2xl font-bold mt-1">{stat.value}</h4>
              </div>
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md", stat.color)}>
                <GraduationCap className="h-5 w-5" />
              </div>
            </div>
          ))}
        </div>

        {/* Table Area */}
        <ScrollArea className="max-h-[50vh] px-8 pb-8">
          <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Таърихи пешрафт (Муфассал)
          </h4>
          <div className="rounded-xl border bg-card/50 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="p-4 text-left font-semibold text-muted-foreground w-20">Ҳафта</th>
                  <th className="p-4 text-left font-semibold text-muted-foreground">Дарсҳо (Баҳоҳо)</th>
                  <th className="p-4 text-center font-semibold text-muted-foreground w-32">Балл (Max 12.5)</th>
                  <th className="p-4 text-right font-semibold text-muted-foreground w-24">Статус</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 16 }).map((_, i) => {
                  const weekNum = i + 1;
                  const weeklyScore = student.weeklyAverages[i] || 0;

                  const weekDays = student.gradesRaw?.filter((d: any) => d.weekNumber === weekNum) || [];
                  const relevantLessons: any[] = [];

                  // Collect relevant lessons for display context
                  weekDays.forEach((day: any) => {
                    day.lessons.forEach((l: any) => {
                      if (String(l.subjectId) === String(subjectId)) {
                        relevantLessons.push(l);
                      }
                    });
                  });

                  // Render lesson chips
                  const lessonDisplays = relevantLessons.map((l, idx) => {
                    if (l.lessonType === "lecture") {
                      return (
                        <Badge key={idx} variant="outline" className="bg-slate-50 text-slate-400 border-dashed">
                          Лек (Att)
                        </Badge>
                      );
                    }

                    const prep = l.preparationGrade !== null ? Number(l.preparationGrade) : 0;
                    const task = l.taskGrade !== null ? Number(l.taskGrade) : 0;
                    // Show raw inputs
                    const label = l.lessonType === "lab" ? "Лаб" : "Ам";

                    return (
                      <div key={idx} className="flex flex-col items-center">
                        <Badge variant="secondary" className="mb-1 text-[10px] h-5 px-1 bg-slate-100 text-slate-600 border border-slate-200">
                          {label}: P{prep}/T{task}
                        </Badge>
                      </div>
                    );
                  });

                  const hasLessons = relevantLessons.length > 0;

                  return (
                    <tr key={i} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="p-4 font-medium whitespace-nowrap text-muted-foreground">Ҳафтаи {weekNum}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2 items-center">
                          {hasLessons ? lessonDisplays : <span className="text-xs text-muted-foreground italic">Дарс набуд</span>}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        {hasLessons || weeklyScore > 0 ? (
                          <div className="flex flex-col items-center">
                            <span className={cn("font-bold text-lg",
                              weeklyScore >= 11 ? "text-emerald-600" :
                                weeklyScore >= 8 ? "text-blue-600" :
                                  weeklyScore >= 6 ? "text-amber-600" : "text-rose-600"
                            )}>{weeklyScore.toFixed(2)}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {hasLessons || weeklyScore > 0 ? (
                          weeklyScore >= 11 ? <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0">Аъло</Badge> :
                            weeklyScore >= 8 ? <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0">Хуб</Badge> :
                              weeklyScore >= 6 ? <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-0">Қаноат</Badge> :
                                <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 border-0">Бад</Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground border-dashed bg-transparent">Нест</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
});

// 3. Memoized Weekly List (Detailed Accordion)
// 2b. Memoized Student Modal (Refactored for Detail View)
const StudentModalRefactored = memo(({ student, subjectName, subjectId, onClose }: { student: any, subjectName: string, subjectId: string | undefined, onClose: () => void }) => {
  if (!student) return null;

  const initials = getInitials(student.fullName);

  return (
    <Dialog open={!!student} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl overflow-hidden p-0 border-0 shadow-2xl bg-card/95 backdrop-blur-xl h-[90vh] flex flex-col">
        <DialogHeader className="p-6 pb-2 border-b bg-muted/10 hidden">
          <DialogTitle>{student.fullName}</DialogTitle>
        </DialogHeader>

        {/* Modal Scroll Container */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            {/* Modal Header */}
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left mb-8">
              <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Badge variant="outline" className="bg-background/50 backdrop-blur border-primary/20 text-primary mb-2 mx-auto md:mx-0 w-fit">
                  Профили донишҷӯ
                </Badge>
                <h2 className="text-3xl font-bold tracking-tight">
                  {student.fullName}
                </h2>
                <p className="text-lg text-muted-foreground font-medium">
                  {subjectName}
                </p>
              </div>
            </div>

            {/* Stat Cards - Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[
                { label: "Блоки 1 (Ҳаф 1-8)", value: student.block1Score + " / 100", color: "bg-blue-500" },
                { label: "Блоки 2 (Ҳаф 9-16)", value: student.block2Score + " / 100", color: "bg-purple-500" },
                { label: "Ҷамъ", value: student.totalAvg.toFixed(2), color: "bg-emerald-500" },
              ].map((stat, i) => (
                <div key={i} className="bg-card border rounded-xl p-4 shadow-lg flex items-center justify-between group hover:border-primary/50 transition-colors">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">{stat.label}</p>
                    <h4 className="text-2xl font-bold mt-1">{stat.value}</h4>
                  </div>
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md", stat.color)}>
                    <GraduationCap className="h-5 w-5" />
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed Breakdown List */}
            <div className="space-y-6">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Таърихи пешрафт (Муфассал)
              </h4>

              <div>
                {Array.from({ length: 16 }).map((_, i) => (
                  <WeeklyBreakdown key={i} weekNum={i + 1} student={student} subjectId={subjectId || ""} />
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
});

const WeeklyGradesList = memo(({ students, subjectId }: { students: any[], subjectId: string }) => {
  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible className="w-full space-y-4">
        {students.map((student, index) => (
          <AccordionItem
            key={student.fullName}
            value={`item-${index}`}
            className="border rounded-xl bg-card px-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-4 w-full">
                <Avatar className="h-10 w-10 border-2 border-muted">
                  <AvatarFallback className="font-bold text-primary">{getInitials(student.fullName)}</AvatarFallback>
                </Avatar>
                <div className="text-left flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-bold text-base">{student.fullName}</p>
                    <p className="text-xs text-muted-foreground">Донишҷӯ</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Миёна</span>
                      <span className={cn("font-bold", student.totalAvg >= 100 ? "text-emerald-600" : "text-rose-600")}>
                        {student.totalAvg.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 pt-2 border-t mt-2">
              {/* Grid of Weeks */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                {Array.from({ length: 16 }).map((_, weekIndex) => {
                  const weekNum = weekIndex + 1;
                  const avg = student.weeklyAverages[weekIndex];

                  // Find detailed grades for this week
                  // Note: grades is flat array of days. We need to filter by weekNumber
                  // Optimization: In a real scenario we'd pre-group, but for render this is okay
                  // ... дохили Array.from({ length: 16 }).map(...)
                  const weekDays = student.gradesRaw?.filter((d: any) => d.weekNumber === weekNum) || [];
                  const gradesInWeek: number[] = [];

                  weekDays.forEach((day: any) => {
                    day.lessons.forEach((l: any) => {
                      if (l.lessonType === "lecture") return;

                      if (String(l.subjectId) === String(subjectId)) {
                        const prep = l.preparationGrade !== null && l.preparationGrade !== undefined ? Number(l.preparationGrade) : 0;
                        const task = l.taskGrade !== null && l.taskGrade !== undefined ? Number(l.taskGrade) : 0;

                        // ИСЛОҲИ АСОСӢ: ҲАМЕША ба 2 тақсим мекунем ва 0-ро ҳам қабул мекунем
                        const lessonGrade = (prep + task) / 2;

                        // Push grade (even if 0) to array for display
                        gradesInWeek.push(lessonGrade);
                      }
                    });
                  });

                  return (
                    <div key={weekNum} className="flex flex-col p-3 rounded-lg bg-muted/30 border relative">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] uppercase text-muted-foreground font-bold">Ҳафтаи {weekNum}</span>
                        {/* Calculate weekly average for display */}
                        {gradesInWeek.length > 0 && (
                          <Badge variant="outline" className={cn("text-[10px] h-5 px-1",
                            avg >= 11 ? "text-emerald-600 border-emerald-200 bg-emerald-50" :
                              avg >= 8 ? "text-blue-600 border-blue-200 bg-blue-50" :
                                avg >= 6 ? "text-amber-600 border-amber-200 bg-amber-50" :
                                  "text-rose-600 border-rose-200 bg-rose-50"
                          )}>
                            Score: {avg.toFixed(1)}
                          </Badge>
                        )}
                      </div>

                      {/* Individual Grades */}
                      <div className="flex flex-wrap gap-1 min-h-[24px]">
                        {gradesInWeek.length > 0 ? (
                          gradesInWeek.map((g, idx) => (
                            <div key={idx} className={cn("w-6 h-6 flex items-center justify-center rounded text-xs font-bold text-white shadow-sm",
                              getGradeStyle(g)
                            )}>
                              {g}
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground/50 italic">Дарс набуд</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
});

// --- MAIN PAGE ---
export default function AdminWeeklyGradePage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [data, setData] = useState<GradebookData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedStudentDetails, setSelectedStudentDetails] = useState<any | null>(null);

  const [semester, setSemester] = useState<1 | 2>(1); // Default logic below

  const apiUrl = import.meta.env.VITE_API_URL;

  // Initial semester set based on date
  useEffect(() => {
    const month = new Date().getMonth();
    if (month >= 1 && month <= 5) {
      setSemester(2);
    } else {
      setSemester(1);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get(`${apiUrl}/groups`, { headers: { Authorization: `Bearer ${token}` } }).then((res) => setGroups(res.data)).catch(console.error);
  }, [apiUrl]);

  const fetchData = async () => {
    if (!selectedGroup) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${apiUrl}/journal/weekly-grades/${selectedGroup}`,
        {
          params: {
            subjectId: selectedSubject || undefined,
            semester: semester // <-- Send semester
          },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setData(res.data);
    } catch (err) {
      console.error(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedGroup) fetchData();
  }, [selectedGroup, selectedSubject, semester]); // <-- Re-fetch on semester change

  // OPTIMIZED CALCULATION: New 16-Week Semester Logic (Max 12.5 per week)
  const subjectStudent16Weeks = useMemo(() => {
    if (!selectedSubject || !data) return [];

    const lessonCounts = data.weeklyLessonCounts?.[selectedSubject] || {};
    const expectedCounts = Array(16).fill(0);
    for (let w = 1; w <= 16; w++) {
      expectedCounts[w - 1] = lessonCounts[w] || 0;
    }

    return data.students.map((student) => {
      const weeklyScores = new Float32Array(16);
      const grades = student.grades;

      // Calculate scores for each week 1-16
      for (let w = 1; w <= 16; w++) {
        const weekIndex = w - 1;

        // 1. Gather all lessons for this subject in this week
        const relevantLessons = [];
        // Loop through all days student has grades for
        for (const day of grades) {
          if (day.weekNumber === w) {
            for (const l of day.lessons) {
              if (String(l.subjectId) === String(selectedSubject)) {
                relevantLessons.push(l);
              }
            }
          }
        }

        const totalLessons = relevantLessons.length;
        if (totalLessons === 0) {
          weeklyScores[weekIndex] = 0;
          continue;
        }

        // 2. Attendance Score (Max 5)
        // Formula: (attended / total) * 5
        const attendedCount = relevantLessons.filter(l => l.attendance === 'present').length;
        const attendanceScore = (attendedCount / totalLessons) * 5;

        // 3. Preparation Score (Max 2.5)
        // Formula: ((sum(prep) / total) / 5) * 2.5
        // preparationGrade 0-5
        const sumPrep = relevantLessons.reduce((acc, l) => acc + (l.preparationGrade || 0), 0);
        const avgPrep = sumPrep / totalLessons;
        const preparationScore = (avgPrep / 5) * 2.5;

        // 4. Assignment Score (Max 5)
        // Applies ONLY to practical and laboratory
        // Formula: ((sum(task) / practiceCount) / 5) * 5
        const practicalLessons = relevantLessons.filter(l => l.lessonType === 'practice' || l.lessonType === 'lab');
        const assignLessonCount = practicalLessons.length;

        let assignmentScore = 0;
        if (assignLessonCount > 0) {
          const sumAssign = practicalLessons.reduce((acc, l) => acc + (l.taskGrade || 0), 0);
          const avgAssign = sumAssign / assignLessonCount;
          assignmentScore = (avgAssign / 5) * 5;
        }

        // Weekly Total
        const weeklyTotal = attendanceScore + preparationScore + assignmentScore;
        weeklyScores[weekIndex] = Number(weeklyTotal.toFixed(2));
      }

      // Block Totals
      const block1Score = weeklyScores.slice(0, 8).reduce((a, b) => a + b, 0); // Weeks 1-8
      const block2Score = weeklyScores.slice(8, 16).reduce((a, b) => a + b, 0); // Weeks 9-16

      // We store block scores. Since UI uses totalAvg, we might map Block 1+2
      // But user wants separate totals.
      // We will sum them for a "Total Semester Score" (Max 200? Or 100 per block independent)
      // UI expects 'totalAvg'. We can use (Block1 + Block2) or keep them separate.
      // Let's store them in the object.

      const totalScore = block1Score + block2Score;

      return {
        fullName: student.fullName,
        weeklyAverages: Array.from(weeklyScores), // Now represents Weekly Scores (0-12.5)
        weeklyExpectedCounts: expectedCounts,
        totalAvg: totalScore, // This is now Total Score (0-200), not average 0-5
        block1Score: Number(block1Score.toFixed(2)),
        block2Score: Number(block2Score.toFixed(2)),
        gradesRaw: grades
      };
    });
  }, [selectedSubject, data]);

  // ... rest ...

  const handleCardClick = React.useCallback((student: any) => {
    setSelectedStudentDetails(student);
  }, []);

  const handleCloseModal = React.useCallback(() => {
    setSelectedStudentDetails(null);
  }, []);

  if (!selectedGroup) {
    // ... same ...
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center p-6">
          <Card className="w-full max-w-xl p-12 text-center shadow-2xl border-0">
            {/* ... */}
            <GraduationCap className="w-24 h-24 mx-auto mb-8 text-primary" />
            <h1 className="text-3xl font-bold mb-4">Баҳоҳои ҳафтагӣ</h1>
            <p className="text-muted-foreground mb-8">Гурӯҳро интихоб кунед</p>
            <Select onValueChange={setSelectedGroup}>
              <SelectTrigger className="w-full text-lg py-6">
                <SelectValue placeholder="Гурӯҳро интихоб кунед..." />
              </SelectTrigger>
              <SelectContent>
                {groups.map((g) => (
                  <SelectItem key={g._id} value={g._id}>
                    {g.name} (Курси {g.course})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  const currentSemesterName = semester === 1
    ? "Семестри 1 (аз 1 сентябр)"
    : "Семестри 2 (аз 1 феврал)";

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <GraduationCap className="w-8 h-8" />
              {data?.groupName || "Гурӯҳ"}
            </h1>
            <p className="text-lg text-muted-foreground">
              Баҳоҳои семестри ҷорӣ — {currentSemesterName}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border">
              <button
                onClick={() => setSemester(1)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${semester === 1
                  ? "bg-white text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Семестри 1
              </button>
              <button
                onClick={() => setSemester(2)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${semester === 2
                  ? "bg-white text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Семестри 2
              </button>
            </div>

            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Гурӯҳ" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((g) => (
                  <SelectItem key={g._id} value={g._id}>
                    {g.name} (Курси {g.course})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="subjects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="subjects">Баҳоҳо барои фанҳо</TabsTrigger>
            <TabsTrigger value="weekly">Ҳафтагӣ (Ҷадвал)</TabsTrigger>
          </TabsList>

          {/* Common Subject Selector Bar - Hoisted for visibility in both tabs */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-muted/30 p-4 rounded-xl border">
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full md:w-96 bg-background">
                <SelectValue placeholder="Фанро интихоб кунед..." />
              </SelectTrigger>
              <SelectContent>
                {data?.subjects?.map((s) => (
                  <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedSubject && data && (
              <Badge variant="secondary" className="text-base px-4 py-1">
                {data.subjects.find((s) => s._id === selectedSubject)?.name}
              </Badge>
            )}
          </div>

          <TabsContent value="weekly">
            {!selectedSubject ? (
              <Card className="p-20 text-center border-dashed border-2 bg-muted/20">
                <div className="bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Фанро интихоб кунед</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Барои дидани ҷадвали пурра, аввал аз рӯйхат фанни лозимаро интихоб намоед.
                </p>
              </Card>
            ) : (
              <WeeklyGradesList
                students={subjectStudent16Weeks}
                subjectId={selectedSubject}
              />
            )}
          </TabsContent>

          <TabsContent value="subjects">
            <div className="space-y-6">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
                </div>
              ) : selectedSubject && data ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
                    {subjectStudent16Weeks.map((sg) => (
                      <StudentCard
                        key={sg.fullName}
                        data={sg}
                        onClick={handleCardClick}
                      />
                    ))}
                  </div>

                  <StudentModalRefactored
                    student={selectedStudentDetails}
                    subjectName={data?.subjects.find(s => s._id === selectedSubject)?.name || ""}
                    subjectId={selectedSubject}
                    onClose={handleCloseModal}
                  />
                </>
              ) : (
                <Card className="p-20 text-center border-dashed border-2 bg-muted/20">
                  <div className="bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Фанро интихоб кунед</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    Барои дидани баҳоҳои донишҷӯён аз рӯйхат фанни лозимаро интихоб намоед.
                  </p>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}