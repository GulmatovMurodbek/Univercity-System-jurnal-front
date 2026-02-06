// src/pages/student/MyGradesPage.tsx
import React, { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, BookOpen, Calendar, ChevronDown, CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// --- TYPES ---
interface Lesson {
  grade: string;
  subject: string;
  lessonType?: "lecture" | "practice" | "lab";
  attendance?: "present" | "absent" | "late";
  preparationGrade?: number;
  taskGrade?: number;
}

interface Day {
  date: string;
  weekday: string;
  lessons: Lesson[];
}

interface Week {
  weekNumber: number;
  weekStart: string;
  weekEnd: string;
  days: Day[];
}

interface Data {
  weeks: Week[];
  semester: number;
  stats: {
    total: number;
    average: number;
    maxGrade: number;
    minGrade: number;
  };
}

// --- HELPERS ---
const getGradeColor = (grade: number) => {
  if (grade >= 4.5) return "bg-emerald-500 text-white shadow-emerald-200";
  if (grade >= 3.5) return "bg-blue-500 text-white shadow-blue-200";
  if (grade >= 3) return "bg-amber-500 text-white shadow-amber-200";
  if (grade > 0) return "bg-rose-500 text-white shadow-rose-200";
  return "bg-slate-200 text-slate-500";
};

const getStatusColor = (status?: string) => {
  if (status === 'present') return "text-emerald-600 bg-emerald-50 border-emerald-200";
  if (status === 'absent') return "text-rose-600 bg-rose-50 border-rose-200";
  if (status === 'late') return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-slate-400 bg-slate-50 border-slate-200";
};

export default function MyGradesPage() {
  const { user } = useAuth();
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [semester, setSemester] = useState<number>(() => {
    const month = new Date().getMonth();
    return (month >= 1 && month <= 5) ? 2 : 1;
  });

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (user?.role !== "student") return;
    setLoading(true);
    axios
      .get(`${apiUrl}/journal/my-grades`, {
        params: { semester },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error(err);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [user, semester]);

  // --- DATA PROCESSING ---
  const { subjectsData, overallAverage } = useMemo(() => {
    if (!data?.weeks) return { subjectsData: [], overallAverage: 0 };

    const subs = new Map<string, {
      name: string;
      lecturesCount: number;
      practicesCount: number;
      labCount: number;
      weeks: Record<number, {
        attendanceScore: number;
        prepScore: number;
        taskScore: number;
        totalScore: number;
        sessions: {
          date: string;
          type: string;
          status: string;
          prep?: number;
          task?: number;
        }[];
      }>;
    }>();

    data.weeks.forEach(w => {
      w.days.forEach(d => {
        d.lessons.forEach(l => {
          if (!l.subject || l.subject === "—") return;

          if (!subs.has(l.subject)) {
            subs.set(l.subject, {
              name: l.subject,
              lecturesCount: 0,
              practicesCount: 0,
              labCount: 0,
              weeks: {}
            });
          }
          const subData = subs.get(l.subject)!;

          // Count Types
          if (l.lessonType === 'lecture') subData.lecturesCount++;
          else if (l.lessonType === 'lab') subData.labCount++;
          else subData.practicesCount++;

          // Initialize week
          if (!subData.weeks[w.weekNumber]) {
            subData.weeks[w.weekNumber] = {
              attendanceScore: 0,
              prepScore: 0,
              taskScore: 0,
              totalScore: 0,
              sessions: []
            };
          }

          subData.weeks[w.weekNumber].sessions.push({
            date: d.date,
            type: l.lessonType || 'practice',
            status: l.attendance || 'absent',
            prep: l.preparationGrade,
            task: l.taskGrade
          });
        });
      });
    });

    // Calculate Scores for each Subject per Week
    const processed = Array.from(subs.values()).map(s => {
      let block1Total = 0;
      let block2Total = 0;

      Object.keys(s.weeks).forEach(wKey => {
        const wNum = Number(wKey);
        const weekData = s.weeks[wNum];

        // 1. Attendance Score (Max 5)
        // Formula: (Held Sessions User was Present / Total Held Sessions) * 5
        const totalSessions = weekData.sessions.length;
        const presentSessions = weekData.sessions.filter(sess => sess.status === 'present').length;

        weekData.attendanceScore = totalSessions > 0 ? (presentSessions / totalSessions) * 5 : 0;

        // 2. Preparation Score (Max 2.5)
        // Formula: Average of Preparation Grades * (Scaling Factor if needed, assuming prep is out of 2.5 already? No, usually grades are 0-5??)
        // User requirement: "averagePreparation x scaling to 2.5"
        // Let's assume raw prep grades are 0-2.5 based on previous context, OR 0-5. 
        // If raw is 0-2.5, then average is directly the score.
        // If raw is 0-5, we divide by 2.
        // Based on JournalEntryPage: values are 1, 1.5, 2, 2.5. Max is 2.5.
        // So Average is the score directly.

        const prepGrades = weekData.sessions
          .map(sess => sess.prep)
          .filter(p => p !== undefined && p !== null) as number[];

        if (prepGrades.length > 0) {
          const avgPrep = prepGrades.reduce((a, b) => a + b, 0) / prepGrades.length;
          // Ensure it doesn't exceed 2.5 just in case
          weekData.prepScore = Math.min(avgPrep, 2.5);
        } else {
          weekData.prepScore = 0;
        }

        // 3. Task/Assignment Score (Max 5) - Practice/Lab Only
        // Formula: Average of Task Grades scaled to 5.
        // Based on JournalEntryPage: Task grades are 0-5. So Average is the score.
        const taskGrades = weekData.sessions
          .filter(sess => sess.type !== 'lecture') // Lectures exclude tasks
          .map(sess => sess.task)
          .filter(t => t !== undefined && t !== null) as number[];

        if (taskGrades.length > 0) {
          weekData.taskScore = taskGrades.reduce((a, b) => a + b, 0) / taskGrades.length;
        } else {
          weekData.taskScore = 0;
        }

        // WEEK TOTAL
        weekData.totalScore = weekData.attendanceScore + weekData.prepScore + weekData.taskScore;

        // BLOCK TOTALS
        if (wNum <= 8) block1Total += weekData.totalScore;
        else if (wNum <= 16) block2Total += weekData.totalScore;
      });

      return {
        ...s,
        block1Total,
        block2Total,
        // Calculate progress based on passed weeks (approx)
        progress: Math.min(Object.keys(s.weeks).length * (100 / 16), 100)
      };
    });

    return { subjectsData: processed, overallAverage: data.stats.average };
  }, [data]);

  // Set default
  useEffect(() => {
    if (subjectsData.length > 0 && !selectedSubject) {
      setSelectedSubject(subjectsData[0].name);
    }
  }, [subjectsData]);

  const activeSubject = subjectsData.find(s => s.name === selectedSubject);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 font-sans">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Баҳоҳои ман</h1>
            <p className="text-slate-500 mt-1">Рейтинг ва пешрафти таълимӣ</p>
          </div>

          <div className="bg-slate-100 p-1 rounded-xl inline-flex self-start">
            {[1, 2].map((s) => (
              <button
                key={s}
                onClick={() => setSemester(s)}
                className={cn(
                  "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                  semester === s ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                )}
              >
                Семестри {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-3xl" />)}
          </div>
        ) : !data || subjectsData.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed">
            <p className="text-slate-400 text-lg">Маълумот нест</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* SECTION 1: SUBJECT CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {subjectsData.map(sub => (
                <button
                  key={sub.name}
                  onClick={() => setSelectedSubject(sub.name)}
                  className={cn(
                    "group relative flex flex-col items-start p-6 rounded-3xl border-2 transition-all duration-300 text-left w-full hover:-translate-y-1",
                    selectedSubject === sub.name
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200"
                      : "bg-white border-slate-100 hover:border-indigo-100 hover:shadow-lg"
                  )}
                >
                  <h3 className={cn("text-lg font-bold mb-3 line-clamp-2", selectedSubject === sub.name ? "text-white" : "text-slate-800")}>
                    {sub.name}
                  </h3>

                  {/* Badges / Summary */}
                  <div className="mb-6 opacity-90">
                    <p className={cn("text-xs font-medium", selectedSubject === sub.name ? "text-indigo-100" : "text-slate-500")}>
                      {sub.lecturesCount > 0 && `${sub.lecturesCount} Лексия `}
                      {sub.practicesCount > 0 && `${sub.practicesCount} Амалӣ `}
                      {sub.labCount > 0 && `${sub.labCount} Лабораторӣ `}
                      дар як ҳафта
                    </p>
                  </div>

                  {/* Block SCORES */}
                  <div className="grid grid-cols-1 w-full gap-3 mt-auto">
                    <div className={cn("p-3 rounded-2xl flex justify-between items-center", selectedSubject === sub.name ? "bg-white/10" : "bg-slate-50")}>
                      <span className={cn("text-xs font-bold opacity-70", selectedSubject === sub.name ? "text-white" : "text-slate-500")}>
                        Баҳои Блоки 1 (Ҳафтаҳои 1–8)
                      </span>
                      <span className={cn("text-lg font-bold", selectedSubject === sub.name ? "text-white" : "text-slate-800")}>{sub.block1Total.toFixed(1)}</span>
                    </div>
                    <div className={cn("p-3 rounded-2xl flex justify-between items-center", selectedSubject === sub.name ? "bg-white/10" : "bg-slate-50")}>
                      <span className={cn("text-xs font-bold opacity-70", selectedSubject === sub.name ? "text-white" : "text-slate-500")}>
                        Баҳои Блоки 2 (Ҳафтаҳои 9–16)
                      </span>
                      <span className={cn("text-lg font-bold", selectedSubject === sub.name ? "text-white" : "text-slate-800")}>{sub.block2Total.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full mt-4">
                    <div className={cn("h-1.5 w-full rounded-full overflow-hidden", selectedSubject === sub.name ? "bg-black/20" : "bg-slate-100")}>
                      <div className="h-full bg-yellow-400" style={{ width: `${sub.progress}%` }}></div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* SECTION 2: WEEKLY BREAKDOWN */}
            {activeSubject && (
              <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-indigo-600 p-2 rounded-xl text-white">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">{activeSubject.name} - Тафсилоти Ҳафтаина</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left: Legend & Info */}
                  <div className="space-y-6">
                    <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden sticky top-6">
                      <div className="bg-slate-50 p-6 border-b border-slate-100">
                        <h4 className="font-bold text-slate-800">Қоидаҳои баҳогузорӣ</h4>
                      </div>
                      <div className="p-6 space-y-6">
                        {/* Attendance */}
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                          <div className="space-y-1">
                            <span className="font-bold block text-slate-700">Баҳои Ҳозирӣ (Max 5)</span>
                            <p className="text-slate-500 text-xs leading-relaxed">
                              Баҳои ҳозирӣ аз рӯи иштироки шумо дар дарсҳо ҳисоб карда мешавад.
                            </p>
                            <div className="bg-slate-50 px-2 py-1 rounded text-[10px] font-mono text-slate-500 inline-block border border-slate-100">
                              Дарсҳои иштироккарда ÷ Ҳамаи дарсҳо × 5
                            </div>
                          </div>
                        </div>

                        {/* Prep */}
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                          <div className="space-y-1">
                            <span className="font-bold block text-slate-700">Баҳои Омодагӣ (Max 2.5)</span>
                            <p className="text-slate-500 text-xs leading-relaxed">
                              Ин баҳо омодагӣ ва фаъолии ҳаррӯзаи шуморо нишон медиҳад.
                            </p>
                            <div className="bg-slate-50 px-2 py-1 rounded text-[10px] font-mono text-slate-500 inline-block border border-slate-100">
                              Миёнаи баҳои омодагӣ
                            </div>
                          </div>
                        </div>

                        {/* Task */}
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                          <div className="space-y-1">
                            <span className="font-bold block text-slate-700">Баҳои Вазифа (Max 5)</span>
                            <p className="text-slate-500 text-xs leading-relaxed">
                              Ин баҳо танҳо барои дарсҳои амалӣ ва лабораторӣ аст.
                            </p>
                            <div className="bg-slate-50 px-2 py-1 rounded text-[10px] font-mono text-slate-500 inline-block border border-slate-100">
                              Миёнаи баҳои иҷрои вазифаҳо
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t mt-4">
                          <div className="text-sm font-bold text-slate-800 flex justify-between">
                            <span>Ҳафтаина (Max)</span>
                            <span className="text-indigo-600">12.5 хол</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Right: Accordion List */}
                  <div className="lg:col-span-2">
                    <ScrollArea className="h-[600px] pr-4">
                      <Accordion type="single" collapsible className="space-y-4">
                        {Object.entries(activeSubject.weeks).map(([weekNum, wData]) => (
                          <AccordionItem key={weekNum} value={weekNum} className="border-none bg-white rounded-3xl shadow-sm overflow-hidden px-1">
                            <AccordionTrigger className="px-6 py-4 hover:bg-slate-50 transition-colors [&[data-state=open]]:bg-slate-50">
                              <div className="flex items-center justify-between w-full mr-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                                    {weekNum}
                                  </div>
                                  <span className="font-bold text-slate-700">Ҳафтаи {weekNum} — Ҷамъ: {wData.totalScore.toFixed(2)} / 12.5</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Badge className={cn("text-base px-3 py-1",
                                    wData.totalScore >= 10 ? "bg-emerald-500" :
                                      wData.totalScore >= 6 ? "bg-amber-500" : "bg-rose-500"
                                  )}>
                                    {wData.totalScore.toFixed(2)}
                                  </Badge>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 py-6 bg-slate-50/50">
                              <div className="space-y-6">

                                {/* 1. ATTENDANCE SECTION */}
                                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                  <div className="flex justify-between mb-3 border-b pb-2">
                                    <h5 className="font-bold text-slate-700 flex items-center gap-2">
                                      <CheckCircle2 className="w-4 h-4 text-green-500" /> Баҳои Ҳозирӣ
                                    </h5>
                                    <span className="font-mono font-bold text-green-600">{wData.attendanceScore.toFixed(2)} / 5</span>
                                  </div>
                                  <div className="space-y-2">
                                    {wData.sessions.map((sess, idx) => (
                                      <div key={idx} className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                          <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-500">
                                            {sess.type === 'lecture' && 'Дарси Лексия'}
                                            {sess.type === 'practice' && 'Дарси Амалӣ'}
                                            {sess.type === 'lab' && 'Дарси Лабораторӣ'}
                                          </Badge>
                                          <span className="text-slate-600">{sess.date}</span>
                                        </div>
                                        <Badge variant="outline" className={cn("capitalize", getStatusColor(sess.status))}>
                                          {sess.status === 'present' ? 'Ҳаст (+)' : 'Нест (-)'}
                                        </Badge>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* 2. PREPARATION SECTION */}
                                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                  <div className="flex justify-between mb-3 border-b pb-2">
                                    <h5 className="font-bold text-slate-700 flex items-center gap-2">
                                      <BookOpen className="w-4 h-4 text-blue-500" /> Баҳои Омодагӣ
                                    </h5>
                                    <span className="font-mono font-bold text-blue-600">{wData.prepScore.toFixed(2)} / 2.5</span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    {wData.sessions.map((sess, idx) => (
                                      <div key={idx} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                                        <span className="text-xs text-slate-500 capitalize">
                                          {sess.type === 'lecture' && 'Лексия'}
                                          {sess.type === 'practice' && 'Амалӣ'}
                                          {sess.type === 'lab' && 'Лабораторӣ'}
                                        </span>
                                        <span className="font-bold text-slate-700">{sess.prep || "—"}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* 3. TASK SECTION */}
                                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                  <div className="flex justify-between mb-3 border-b pb-2">
                                    <h5 className="font-bold text-slate-700 flex items-center gap-2">
                                      <TrendingUp className="w-4 h-4 text-purple-500" /> Баҳои Вазифа
                                    </h5>
                                    <span className="font-mono font-bold text-purple-600">{wData.taskScore.toFixed(2)} / 5</span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    {wData.sessions.filter(s => s.type !== 'lecture').map((sess, idx) => (
                                      <div key={idx} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                                        <span className="text-xs text-slate-500 capitalize">
                                          {sess.type === 'practice' && 'Амалӣ'}
                                          {sess.type === 'lab' && 'Лабораторӣ'}
                                        </span>
                                        <span className="font-bold text-slate-700">{sess.task || "—"}</span>
                                      </div>
                                    ))}
                                    {wData.sessions.filter(s => s.type !== 'lecture').length === 0 && (
                                      <span className="text-xs text-slate-400 italic">Дарси амалӣ/лабораторӣ нест</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </ScrollArea>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}