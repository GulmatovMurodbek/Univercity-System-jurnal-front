import React, { useState, useEffect, useMemo, memo } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, BookOpen, ChevronDown, ChevronUp, Search } from "lucide-react";
import axios from "axios";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Save, X, Clock } from "lucide-react";
import { differenceInWeeks, startOfDay } from "date-fns";

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
const WeeklyBreakdown = memo(({ weekNum, student, subjectId, onEdit, isEditing, editingData, onUpdateField, canEdit }: {
  weekNum: number,
  student: any,
  subjectId: string,
  onEdit?: (w: number) => void,
  isEditing?: boolean,
  editingData?: any[],
  onUpdateField?: (lessonKey: string, field: string, value: any) => void,
  canEdit?: boolean
}) => {
  const { user } = useAuth();
  const weekDays = student.gradesRaw?.filter((d: any) => d.weekNumber === weekNum) || [];
  const relevantLessons: any[] = [];

  weekDays.forEach((day: any) => {
    day.lessons.forEach((l: any) => {
      if (String(l.subjectId) === String(subjectId)) {
        relevantLessons.push({ ...l, date: day.date, weekday: day.weekday, dateStr: day.dateStr });
      }
    });
  });

  const markedLessons = relevantLessons.filter(l => l.attendance !== null);
  const markedCount = markedLessons.length;

  if (markedCount === 0) {
    return (
      <div className="flex items-center justify-between p-4 border rounded-xl bg-amber-50/20 text-amber-600 mb-4 border-amber-100">
        <span className="font-semibold italic flex items-center gap-2">
          <Clock className="w-4 h-4" /> Ҳафтаи {weekNum} — То ҳол қайд нашудааст
        </span>
      </div>
    );
  }

  const attendedCount = markedLessons.filter(l => l.attendance === 'present' || l.attendance === 'late').length;
  const attendanceScore = (attendedCount / markedCount) * 5;

  const preparationScore = markedLessons.reduce((max, l) => {
    const val = Number(l.preparationGrade);
    return (!isNaN(val) && val > max) ? val : max;
  }, 0);

  const practicalMarked = markedLessons.filter(l => l.lessonType === 'practice' || l.lessonType === 'lab');
  const assignmentScore = practicalMarked.reduce((max, l) => {
    const val = Number(l.taskGrade);
    return (!isNaN(val) && val > max) ? val : max;
  }, 0);

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

  const firstEditItem = editingData && editingData.length > 0 ? editingData[0] : null;

  return (
    <div className={cn(
      "border rounded-xl overflow-hidden bg-white mb-4 shadow-sm hover:shadow-md transition-all font-sans",
      isEditing && "ring-2 ring-indigo-500 border-indigo-200 shadow-indigo-100"
    )}>
      <div className={cn("p-4 border-b flex justify-between items-center", isEditing ? "bg-indigo-50/50" : "bg-slate-50")}>
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
          {onEdit && !isEditing && canEdit && (
            <Button
              size="sm"
              variant="ghost"
              className="text-indigo-600 h-8 font-bold hover:bg-indigo-50"
              onClick={() => {
                const isAuthorized = user?.role === 'admin' || relevantLessons.some(l => String(l.teacherId) === String(user?._id));
                if (isAuthorized) {
                  onEdit(weekNum);
                } else {
                  toast.error("Шумо танҳо дарсҳои худатонро таҳрир карда метавонед");
                }
              }}
            >
              Таҳрир
            </Button>
          )}
          {onEdit && !isEditing && !canEdit && (
            <span className="text-[10px] text-slate-400 font-medium px-2">🔒 Танҳо хондан</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-dashed">
            <div className="p-1.5 rounded-md bg-blue-100 text-blue-700">
              <BookOpen className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-sm">Attendance (Max 5)</h4>
          </div>

          <div className="space-y-2">
            {relevantLessons.map((l, idx) => {
              const editItem = editingData?.find(ed => ed.date === l.dateStr && ed.slot === l.lessonSlot);
              return (
                <div key={idx} className="flex flex-col gap-2 p-2 rounded bg-slate-50 border border-slate-100">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase w-10 text-center", getLessonTypeColor(l.lessonType))}>
                        {getLessonTypeLabel(l.lessonType)}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">{l.date}</span>
                    </div>
                    {!isEditing && (
                      l.attendance ? (
                        <Badge variant="outline" className={cn("border-0 font-medium",
                          l.attendance === 'present' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                        )}>
                          {l.attendance === 'present' ? "Ҳозир" : "Ғоиб"}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground mr-2">—</span>
                      )
                    )}
                  </div>
                  {isEditing && editItem && (
                    <Select
                      value={editItem.attendance}
                      onValueChange={(v) => onUpdateField?.(`${l.dateStr}_${l.lessonSlot}`, 'attendance', v)}
                    >
                      <SelectTrigger className="h-8 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="present">✅ Ҳозир</SelectItem>
                        <SelectItem value="absent">❌ Ғоиб</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-dashed">
            <p className="text-xs text-slate-500 text-center font-mono bg-slate-50 p-2 rounded">
              {attendedCount} / {markedCount} × 5 = <span className="font-bold text-foreground">{attendanceScore.toFixed(2)}</span>
            </p>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-dashed">
            <div className="p-1.5 rounded-md bg-purple-100 text-purple-700">
              <BookOpen className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-sm">Preparation (Max 2.5)</h4>
          </div>

          <div className="flex flex-col items-center justify-center py-6 gap-4">
            {isEditing && firstEditItem ? (
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs text-violet-600 font-semibold uppercase">Тайёрӣ</span>
                <Select
                  value={String(firstEditItem.preparationGrade ?? "")}
                  onValueChange={(v) => {
                    const firstLesson = relevantLessons[0];
                    if (firstLesson) {
                      onUpdateField?.(`${firstLesson.dateStr}_${firstLesson.lessonSlot}`, 'preparationGrade', v);
                    }
                  }}
                >
                  <SelectTrigger className="h-12 w-24 text-center text-xl font-bold border-2 border-violet-300 bg-violet-50">
                    <SelectValue placeholder="–" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="1.5">1.5</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="2.5">2.5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-4xl font-bold text-violet-600 mb-1">{preparationScore}</div>
                <div className="text-xs text-slate-400">із 2.5 балов</div>
              </div>
            )}
          </div>

          <div className="mt-auto pt-3 border-t border-dashed">
            <p className="text-xs text-slate-500 text-center font-mono bg-slate-50 p-2 rounded">
              Балли тайёрӣ: <span className="font-bold text-foreground">{preparationScore.toFixed(2)}</span> / 2.5
            </p>
          </div>
        </div>

        <div className="p-4 space-y-3 bg-orange-50/30">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-dashed">
            <div className="p-1.5 rounded-md bg-orange-100 text-orange-700">
              <BookOpen className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-sm">Assignment (Max 5)</h4>
          </div>

          <div className="flex flex-col items-center justify-center py-6 gap-4">
            {isEditing && firstEditItem ? (
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs text-amber-600 font-semibold uppercase">Вазифа</span>
                <Select
                  value={String(firstEditItem.taskGrade ?? "")}
                  onValueChange={(v) => {
                    const firstLesson = relevantLessons[0];
                    if (firstLesson) {
                      onUpdateField?.(`${firstLesson.dateStr}_${firstLesson.lessonSlot}`, 'taskGrade', v);
                    }
                  }}
                >
                  <SelectTrigger className="h-12 w-24 text-center text-xl font-bold border-2 border-amber-300 bg-amber-50">
                    <SelectValue placeholder="–" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-4xl font-bold text-amber-600 mb-1">{assignmentScore}</div>
                <div className="text-xs text-slate-400">із 5 балов</div>
              </div>
            )}
          </div>

          <div className="mt-auto pt-3 border-t border-dashed">
            <p className="text-xs text-slate-500 text-center font-mono bg-slate-50 p-2 rounded">
              Assignment = <span className="font-bold text-foreground">{assignmentScore.toFixed(2)}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

// 3. Memoized Weekly List (Detailed Accordion)
const WeeklyGradesList = memo(({ students, subjectId, currentWeek, userRole }: { students: any[], subjectId: string, currentWeek: number, userRole: string | undefined }) => {
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-xl bg-card/60 backdrop-blur-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-gradient-to-r from-primary/10 to-transparent p-6 border-b">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary" />
              Ҷадвали ҳафтагӣ ва баҳоҳо
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Баҳоҳои донишҷӯён барои ҳар ҳафта дар шакли рӯйхати кушодашаванда</p>
          </div>

          <ScrollArea className="h-[calc(100vh-400px)]">
            <div className="p-6">
              <Accordion type="single" collapsible className="w-full space-y-4">
                {students.map((student, index) => (
                  <AccordionItem
                    key={student._id || index}
                    value={`item-${index}`}
                    className="border rounded-xl bg-card px-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <AccordionTrigger className="hover:no-underline py-4">
                      {/* ... Header Content ... */}
                      <div className="flex items-center gap-4 w-full text-left">
                        <Avatar className="h-10 w-10 border-2 border-muted">
                          <AvatarFallback className="font-bold text-primary">{getInitials(student.fullName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-base">{student.fullName}</p>
                          <p className="text-sm font-medium text-muted-foreground">Ҷамъ: <span className="text-foreground">{student.totalAvg.toFixed(2)}</span></p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 pt-2 border-t mt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                        {Array.from({ length: 16 }).map((_, weekIndex) => {
                          const weekNum = weekIndex + 1;
                          if ((userRole === 'teacher' || userRole === 'director') && weekNum > currentWeek) return null;

                          return (
                            <div key={weekNum} className="p-3 border rounded-lg bg-muted/20 flex justify-between items-center group hover:border-primary/50 transition-colors">
                              <span className="text-sm font-medium">Ҳафтаи {weekNum}</span>
                              <Badge variant={student.weeklyAverages[weekIndex] > 0 ? "secondary" : "outline"} className="font-bold">
                                {student.weeklyAverages[weekIndex]?.toFixed(2) || "0.00"}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
});
const getCurrentWeekNum = (semesterStart: string | undefined, course?: number, semester?: number): number => {
  // Course 4, Semester 2 starts Jan 19
  let startDate: Date;
  if (semesterStart) {
    startDate = new Date(semesterStart);
  } else if (course === 4 && semester === 2) {
    const year = new Date().getFullYear();
    startDate = new Date(`${year}-01-19`);
  } else if (semester === 2) {
    const year = new Date().getFullYear();
    startDate = new Date(`${year}-02-01`);
  } else {
    const year = new Date().getFullYear();
    startDate = new Date(`${year}-09-01`);
  }
  const now = new Date();
  const diffMs = now.getTime() - startDate.getTime();
  if (diffMs < 0) return 0; // Semester hasn't started
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.min(16, Math.floor(diffDays / 7) + 1);
};

const StudentModalRefactored = memo(({ student, subjectName, subjectId, groupId, semesterStart, course, semester, onSave, onClose }: {
  student: any,
  subjectName: string,
  subjectId: string | undefined,
  groupId: string,
  semesterStart?: string,
  course?: number,
  semester?: number,
  onSave?: () => void,
  onClose: () => void
}) => {
  const { user } = useAuth();
  if (!student) return null;

  const [editingWeek, setEditingWeek] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  // Current week: can edit current week and past, but not future
  const currentWeek = getCurrentWeekNum(semesterStart, course, semester);

  const initials = getInitials(student.fullName);

  const handleEditWeek = (weekNum: number) => {
    const weekDays = student.gradesRaw?.filter((d: any) => d.weekNumber === weekNum) || [];
    const relevantLessons: any[] = [];

    weekDays.forEach((day: any) => {
      day.lessons.forEach((l: any) => {
        if (String(l.subjectId) === String(subjectId)) {
          relevantLessons.push({
            date: day.dateStr,
            slot: l.lessonSlot,
            attendance: l.attendance || 'present',
            preparationGrade: l.preparationGrade ?? "",
            taskGrade: l.taskGrade ?? "",
          });
        }
      });
    });

    setEditingData(relevantLessons);
    setEditingWeek(weekNum);
  };

  const handleUpdateField = (lessonKey: string, field: string, value: any) => {
    if (field === 'preparationGrade' || field === 'taskGrade') {
      // Sync across all lessons for this week
      setEditingData(prev => prev.map(item => ({ ...item, [field]: value })));
    } else {
      const [date, slot] = lessonKey.split('_');
      setEditingData(prev => prev.map(item =>
        (item.date === date && String(item.slot) === slot) ? { ...item, [field]: value } : item
      ));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const updates = editingData.map(item => ({
        groupId: groupId,
        subjectId: subjectId,
        date: item.date,
        slot: item.slot,
        students: [{
          studentId: student._id,
          attendance: item.attendance,
          preparationGrade: item.preparationGrade === "" ? null : Number(item.preparationGrade),
          taskGrade: item.taskGrade === "" ? null : Number(item.taskGrade)
        }]
      }));

      // Authorization check (Client side)
      if (user?.role !== 'admin') {
        const canSave = student.gradesRaw?.some((d: any) =>
          d.lessons?.some((l: any) => {
            const isMatch = String(l.subjectId) === String(subjectId);
            const tid = (l.teacherId as any)?._id || l.teacherId;
            const uid = user?.id || user?._id;
            return isMatch && String(tid) === String(uid);
          })
        );

        if (!canSave) {
          toast.error("Шумо муаллими ин фан нестед");
          setIsSaving(false);
          return;
        }
      }

      await axios.post(`${apiUrl}/journal/bulk-update`, { updates }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Тағйиротҳо бомуваффақият сабт шуданд");
      setEditingWeek(null);
      onSave?.();
    } catch (err) {
      console.error(err);
      toast.error("Хатогӣ ҳангоми сабти тағйирот");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={!!student} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl overflow-hidden p-0 border-0 shadow-2xl bg-card/95 backdrop-blur-xl h-[90vh] flex flex-col">
        <DialogHeader className="p-6 pb-2 border-b bg-muted/10 hidden">
          <DialogTitle>{student.fullName}</DialogTitle>
        </DialogHeader>

        {/* Modal Scroll Container */}
        <ScrollArea className="flex-1 w-full p-6">
          {/* Modal Header */}
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left mb-8">
            <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
              <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2 flex-1">
              <div className="flex justify-between items-start">
                <div>
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
                {editingWeek && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingWeek(null)} disabled={isSaving}>
                      Бекор кардан
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={isSaving}>
                      {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Сабт кардан
                    </Button>
                  </div>
                )}
              </div>
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
                <WeeklyBreakdown
                  key={i}
                  weekNum={i + 1}
                  student={student}
                  subjectId={subjectId || ""}
                  onEdit={handleEditWeek}
                  isEditing={editingWeek === (i + 1)}
                  editingData={editingWeek === (i + 1) ? editingData : undefined}
                  onUpdateField={handleUpdateField}
                  canEdit={(i + 1) <= currentWeek}
                />
              ))}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
});

const WeeklyBulkEditModal = ({
  isOpen,
  onClose,
  group,
  subject,
  students,
  semester,
  semesterStart,
  onSuccess
}: {
  isOpen: boolean;
  onClose: () => void;
  group: { _id: string, name: string };
  subject: { _id: string, name: string };
  students: any[];
  semester: number;
  semesterStart: string | undefined;
  onSuccess: () => void;
}) => {
  const { user } = useAuth();
  const [week, setWeek] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editingData, setEditingData] = useState<any[]>([]);
  const apiUrl = import.meta.env.VITE_API_URL;

  // Initialize editing data when students or week change
  useEffect(() => {
    if (isOpen && students.length > 0) {
      const initialData = students.map(s => {
        const weekGrades = s.gradesRaw?.filter((d: any) => d.weekNumber === week) || [];

        // Collect all lessons for this subject this week (per-lesson attendance)
        const lessons: any[] = [];
        weekGrades.forEach((day: any) => {
          day.lessons.forEach((l: any) => {
            if (String(l.subjectId) === String(subject._id)) {
              lessons.push({
                date: day.dateStr,
                dateLabel: day.date,
                slot: l.lessonSlot || 1,
                attendance: l.attendance || 'present',
                lessonType: l.lessonType || 'practice',
                teacherId: l.teacherId || null,
              });
            }
          });
        });

        const allLessons = weekGrades.flatMap((d: any) =>
          d.lessons.filter((l: any) => String(l.subjectId) === String(subject._id))
        );
        // Get prep/task from first lesson that has any grade recorded
        const lessonWithPrep = allLessons.find(l => l.preparationGrade != null && l.preparationGrade !== "");
        const lessonWithTask = allLessons.find(l => l.taskGrade != null && l.taskGrade !== "");

        return {
          studentId: s._id,
          fullName: s.fullName,
          preparationGrade: (lessonWithPrep?.preparationGrade ?? "").toString(),
          taskGrade: (lessonWithTask?.taskGrade ?? "").toString(),
          lessons,
        };
      });
      setEditingData(initialData);
    }
  }, [isOpen, students, week, subject._id]);

  const handleAttendanceUpdate = (studentId: string, lessonIdx: number, value: string) => {
    setEditingData(prev => prev.map(item =>
      item.studentId === studentId
        ? { ...item, lessons: item.lessons.map((l: any, i: number) => i === lessonIdx ? { ...l, attendance: value } : l) }
        : item
    ));
  };

  const handleGradeUpdate = (studentId: string, field: string, value: any) => {
    setEditingData(prev => prev.map(item =>
      item.studentId === studentId ? { ...item, [field]: value } : item
    ));
  };

  // Helper to guess date based on week number if no lesson exists yet
  const getFallbackDate = (w: number, semStart: string | undefined) => {
    if (!semStart) return new Date().toISOString().split('T')[0];
    const start = new Date(semStart);
    const fallback = new Date(start);
    fallback.setDate(start.getDate() + (w - 1) * 7);
    return fallback.toISOString().split('T')[0];
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // Group by date+slot; apply prep/task to first lesson of each student
      const lessonMap = new Map<string, { date: string; slot: number; teacherId: string | null; studentsMap: Map<string, any> }>();

      const stableFallbackDate = getFallbackDate(week, semesterStart);

      editingData.forEach(item => {
        if (item.lessons.length > 0) {
          item.lessons.forEach((lesson: any, lIdx: number) => {
            const key = `${lesson.date}_${lesson.slot}`;
            if (!lessonMap.has(key)) {
              lessonMap.set(key, {
                date: lesson.date,
                slot: lesson.slot,
                teacherId: lesson.teacherId,
                studentsMap: new Map()
              });
            }
            const stData: any = {
              studentId: item.studentId,
              attendance: lesson.attendance,
              preparationGrade: item.preparationGrade === "" ? null : Number(item.preparationGrade),
              taskGrade: item.taskGrade === "" ? null : Number(item.taskGrade),
            };
            lessonMap.get(key)!.studentsMap.set(item.studentId, stData);
          });
        } else {
          const key = `${stableFallbackDate}_1`;
          if (!lessonMap.has(key)) lessonMap.set(key, {
            date: stableFallbackDate,
            slot: 1,
            teacherId: null,
            studentsMap: new Map()
          });
          lessonMap.get(key)!.studentsMap.set(item.studentId, {
            studentId: item.studentId,
            attendance: 'present',
            preparationGrade: item.preparationGrade === "" ? null : Number(item.preparationGrade),
            taskGrade: item.taskGrade === "" ? null : Number(item.taskGrade),
          });
        }
      });

      const updates = Array.from(lessonMap.values()).map(entry => ({
        groupId: group._id,
        subjectId: subject._id,
        date: entry.date,
        shift: 1,
        slot: entry.slot,
        teacherId: entry.teacherId,
        students: Array.from(entry.studentsMap.values()),
      }));

      // Authorization Check (Client side fallback)
      if (user?.role !== 'admin') {
        const isTeacherForSubject = students.some(s =>
          s.gradesRaw?.some((d: any) =>
            d.lessons?.some((l: any) => {
              const isMatch = String(l.subjectId) === String(subject._id);
              const tid = (l.teacherId as any)?._id || l.teacherId;
              const uid = user?.id || user?._id;
              return isMatch && String(tid) === String(uid);
            })
          )
        );

        if (!isTeacherForSubject) {
          toast.error("Шумо муаллими ин фан нестед");
          setLoading(false);
          return;
        }
      }

      const res = await axios.post(`${apiUrl}/journal/bulk-update`, { updates }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { saved, studentsCount, errors } = res.data || {};

      // If nothing saved and there are errors, show first error
      if (Number(saved) === 0 && errors && errors.length > 0) {
        toast.error(errors[0]);
        return;
      }

      const displayCount = studentsCount ?? updates.reduce((a: number, u: any) => a + u.students.length, 0);
      toast.success(`✅ ${displayCount} нафар барои ҳафтаи ${week} сабт шуд`);

      if (errors && errors.length > 0) {
        console.warn("Bulk update partial errors:", errors);
      }

      onClose(); // Close first
      onSuccess(); // Then refetch
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Хатогӣ ҳангоми сабти баҳоҳо");
    } finally {
      setLoading(false);
    }
  };

  const ATTENDANCE_COLORS: Record<string, string> = {
    present: "text-emerald-700 bg-emerald-50 border-emerald-300",
    absent: "text-rose-700 bg-rose-50 border-rose-300",
  };
  const ATTENDANCE_LABELS: Record<string, string> = {
    present: "Ҳозир",
    absent: "Ғоиб",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[92vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-0 flex-shrink-0">
          <DialogTitle className="text-xl flex items-center gap-2 font-bold">
            <Save className="w-5 h-5 text-primary" />
            Таҳрири якҷояи баҳоҳо — {group.name}
          </DialogTitle>
          <div className="flex items-center gap-4 mt-3 bg-muted/40 p-3 rounded-lg border">
            <div className="flex-1">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Фан</p>
              <p className="font-bold text-sm">{subject.name}</p>
            </div>
            <div className="w-36">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Ҳафта</p>
              <Select value={String(week)} onValueChange={(v) => setWeek(Number(v))}>
                <SelectTrigger className="h-9 bg-background border-primary/30 font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(() => {
                    let maxWeeks = 16;
                    if (user?.role !== "admin" && semesterStart) {
                      const start = startOfDay(new Date(semesterStart));
                      const now = startOfDay(new Date());
                      const calculatedWeek = differenceInWeeks(now, start) + 1;
                      maxWeeks = Math.min(16, Math.max(1, calculatedWeek));
                    }
                    return Array.from({ length: maxWeeks }).map((_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>Ҳафтаи {i + 1}</SelectItem>
                    ));
                  })()}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground bg-blue-50/60 border border-blue-100 rounded-lg px-3 py-2 mt-2">
            <span className="font-semibold text-blue-700">📋 Роҳнамо:</span>
            <span>• <b>Давомот</b> — ба ҳар дарс алоҳида</span>
            <span>• <b>Тайёрӣ ва Вазифа</b> — як бор дар ҳафта</span>
          </div>
        </DialogHeader>

        {/* Students List */}
        <ScrollArea className="flex-1 px-6 py-3">
          <div className="space-y-2">
            {editingData.map((item, idx) => (
              <div key={item.studentId} className="border rounded-xl overflow-hidden bg-white shadow-sm">
                {/* Student header: name + prep/task */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-sm">{item.fullName}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[9px] text-violet-500 font-bold uppercase tracking-wider">Тайёрӣ</span>
                      <div className="relative">
                        <Select
                          value={String(item.preparationGrade ?? "")}
                          onValueChange={(v) => handleGradeUpdate(item.studentId, "preparationGrade", v)}
                        >
                          <SelectTrigger className="h-9 w-20 text-center font-bold text-base border-2 border-violet-200 focus:border-violet-500 bg-violet-50 rounded-lg justify-center gap-1">
                            <SelectValue placeholder="–" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="1.5">1.5</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="2.5">2.5</SelectItem>
                          </SelectContent>
                        </Select>
                        <span className="absolute -bottom-3.5 left-0 right-0 text-center text-[9px] text-violet-400">/ 2.5</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[9px] text-amber-500 font-bold uppercase tracking-wider">Вазифа</span>
                      <div className="relative">
                        <Select
                          value={String(item.taskGrade ?? "")}
                          onValueChange={(v) => handleGradeUpdate(item.studentId, "taskGrade", v)}
                        >
                          <SelectTrigger className="h-9 w-20 text-center font-bold text-base border-2 border-amber-200 focus:border-amber-500 bg-amber-50 rounded-lg justify-center gap-1">
                            <SelectValue placeholder="–" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">0</SelectItem>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                            <SelectItem value="5">5</SelectItem>
                          </SelectContent>
                        </Select>
                        <span className="absolute -bottom-3.5 left-0 right-0 text-center text-[9px] text-amber-400">/ 5</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Per-lesson attendance */}
                {item.lessons.length > 0 ? (
                  <div className="px-4 py-2 flex flex-wrap gap-2">
                    {item.lessons.map((lesson: any, lIdx: number) => (
                      <div key={lIdx} className="flex items-center gap-1.5 border rounded-lg px-2 py-1 bg-slate-50/80">
                        <span className={cn(
                          "text-[9px] font-bold px-1 py-0.5 rounded border uppercase",
                          lesson.lessonType === 'lecture' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                            lesson.lessonType === 'lab' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                              'bg-green-100 text-green-700 border-green-200'
                        )}>
                          {lesson.lessonType === 'lecture' ? 'ЛЕК' : lesson.lessonType === 'lab' ? 'ЛАБ' : 'АМА'}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {lesson.dateLabel || lesson.date?.substring(5, 10)}
                        </span>
                        <Select
                          value={lesson.attendance}
                          onValueChange={(v) => handleAttendanceUpdate(item.studentId, lIdx, v)}
                        >
                          <SelectTrigger className={cn(
                            "h-6 text-[10px] font-bold border px-1.5 min-w-[68px]",
                            ATTENDANCE_COLORS[lesson.attendance] || "bg-slate-100"
                          )}>
                            <SelectValue>
                              {ATTENDANCE_LABELS[lesson.attendance] || lesson.attendance}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent position="popper" sideOffset={4}>
                            <SelectItem value="present">✅ Ҳозир</SelectItem>
                            <SelectItem value="absent">❌ Ғоиб</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-2 text-xs text-muted-foreground italic">
                    Дарс сабт нашудааст — баҳо бевосита сабт мешавад
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-between items-center bg-muted/5 flex-shrink-0">
          <span className="text-xs text-muted-foreground">{editingData.length} донишҷӯ • Ҳафтаи {week}</span>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              <X className="w-4 h-4 mr-2" /> Бекор кардан
            </Button>
            <Button onClick={handleSubmit} disabled={loading} className="min-w-[130px]">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Сабт кардан
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// --- MAIN PAGE ---
export default function AdminWeeklyGradePage() {
  const { user } = useAuth();
  const { groupId: paramGroupId } = useParams();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState(paramGroupId || "");
  const [data, setData] = useState<GradebookData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedStudentDetails, setSelectedStudentDetails] = useState<any | null>(null);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [semester, setSemester] = useState<1 | 2>(1); // Default logic below

  const apiUrl = import.meta.env.VITE_API_URL;

  // Sync param to state if it changes
  useEffect(() => {
    if (paramGroupId) {
      setSelectedGroup(paramGroupId);
    }
  }, [paramGroupId]);

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

      // Auto-select first subject if none selected
      if (!selectedSubject && res.data.subjects && res.data.subjects.length > 0) {
        setSelectedSubject(res.data.subjects[0]._id);
      }
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

    const filteredStudents = searchQuery
      ? data.students.filter(s => s.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
      : data.students;

    return filteredStudents.map((student) => {
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

        // Only count lessons that have been "marked" (attendance is not null)
        const markedLessons = relevantLessons.filter(l => l.attendance !== null);
        const markedCount = markedLessons.length;

        // 2. Attendance Score (Max 5)
        let attendanceScore = 0;
        if (markedCount > 0) {
          const attendedCount = markedLessons.filter(l => l.attendance === 'present' || l.attendance === 'late').length;
          attendanceScore = (attendedCount / markedCount) * 5;
        }

        // 3. Preparation Score (Max 2.5)
        // Correct Logic: Take the MAXIMUM grade recorded in the week for this subject.
        // This makes it robust against mixed marking (e.g. one lesson marked grade, another just attendance).
        let preparationScore = 0;
        if (markedCount > 0) {
          const maxPrep = markedLessons.reduce((max, l) => {
            const val = Number(l.preparationGrade);
            return (!isNaN(val) && val > max) ? val : max;
          }, 0);
          preparationScore = maxPrep;
        }

        // 4. Assignment Score (Max 5)
        // Correct Logic: Take the MAXIMUM grade recorded in the week.
        const practicalMarked = markedLessons.filter(l => l.lessonType === 'practice' || l.lessonType === 'lab');
        let assignmentScore = 0;
        if (practicalMarked.length > 0) {
          const maxAssign = practicalMarked.reduce((max, l) => {
            const val = Number(l.taskGrade);
            return (!isNaN(val) && val > max) ? val : max;
          }, 0);
          assignmentScore = maxAssign;
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
        _id: student._id,
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
    : (data as any)?.course === 4
      ? "Семестри 2 (аз 19 январ)"
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

          {/* Semester and Search Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl border-2 border-primary/20 focus-within:border-primary transition-all shadow-inner w-full sm:w-64">
              <Search className="w-5 h-5 text-primary/60" />
              <input
                type="text"
                placeholder="Ҷустуҷӯи донишҷӯ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm font-medium w-full placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center gap-4 ml-auto">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Семестр:</span>
                <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setSemester(1)}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-sm font-bold transition-all",
                      semester === 1
                        ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                    1
                  </button>
                  <button
                    onClick={() => setSemester(2)}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-sm font-bold transition-all",
                      semester === 2
                        ? "bg-white dark:bg-slate-700 text-primary shadow-sm shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                    2
                  </button>
                </div>
              </div>
            </div>
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
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-base px-4 py-1">
                  {data.subjects.find((s) => s._id === selectedSubject)?.name}
                </Badge>
                <Button
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all active:scale-95"
                  onClick={() => setIsBulkEditOpen(true)}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Таҳрири якҷоя
                </Button>
              </div>
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
                currentWeek={getCurrentWeekNum((data as any)?.semesterStart, (data as any)?.course, semester)}
                userRole={user?.role}
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
                    groupId={selectedGroup}
                    semesterStart={(data as any).semesterStart}
                    course={(data as any).course}
                    semester={semester}
                    onSave={fetchData}
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

        {selectedSubject && data && (
          <WeeklyBulkEditModal
            isOpen={isBulkEditOpen}
            onClose={() => setIsBulkEditOpen(false)}
            group={{ _id: selectedGroup, name: data.groupName }}
            subject={{
              _id: selectedSubject,
              name: data.subjects.find(s => s._id === selectedSubject)?.name || ""
            }}
            students={subjectStudent16Weeks}
            semester={semester}
            semesterStart={(data as any).semesterStart}
            onSuccess={fetchData}
          />
        )}
      </div>
    </DashboardLayout >
  );
}