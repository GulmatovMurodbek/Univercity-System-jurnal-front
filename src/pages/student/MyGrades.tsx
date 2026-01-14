// src/pages/student/MyGradesPage.tsx
import React, { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, BookOpen, Calendar, Calculator, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

// --- TYPES ---
interface Lesson {
  grade: string;
  subject: string;
  lessonType?: "lecture" | "practice" | "lab";
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
const getGradeColor = (grade: string | number) => {
  if (grade === "—" || grade === null) return "bg-gray-100 text-gray-400 border-gray-200";
  const num = parseFloat(String(grade));
  if (num >= 4.5) return "bg-emerald-500 text-white shadow-emerald-200";
  if (num >= 3.5) return "bg-blue-500 text-white shadow-blue-200";
  if (num >= 3) return "bg-amber-500 text-white shadow-amber-200";
  if (num > 0) return "bg-rose-500 text-white shadow-rose-200";
  return "bg-gray-200 text-gray-500";
};

const getAverageColorText = (avg: number) => {
  if (avg >= 4.5) return "text-emerald-600";
  if (avg >= 3.5) return "text-blue-600";
  if (avg >= 3) return "text-amber-600";
  return "text-rose-600";
};

export default function MyGradesPage() {
  const { user } = useAuth();
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [semester, setSemester] = useState<number>(() => {
    // Default semester logic
    const month = new Date().getMonth();
    return (month >= 1 && month <= 5) ? 2 : 1;
  });

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (user?.role !== "student") return;
    setLoading(true);
    axios
      .get(`${apiUrl}/journal/my-grades`, {
        params: { semester }, // Send semester param
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [user, semester]); // Re-fetch on semester change

  // --- DATA PROCESSING ---
  const { subjectsData, overallAverage } = useMemo(() => {
    if (!data?.weeks) return { subjectsData: [], overallAverage: 0 };

    const subs = new Map<string, {
      name: string;
      grades: number[];
      lecturesCount: number;
      practicesCount: number;
      weeks: Record<number, number[]>; // grades per week
    }>();

    data.weeks.forEach(w => {
      w.days.forEach(d => {
        d.lessons.forEach(l => {
          if (!l.subject || l.subject === "—") return;

          if (!subs.has(l.subject)) {
            subs.set(l.subject, {
              name: l.subject,
              grades: [],
              lecturesCount: 0,
              practicesCount: 0,
              weeks: {}
            });
          }
          const subData = subs.get(l.subject)!;

          // Count Types
          if (l.lessonType === 'lecture') subData.lecturesCount++;
          else subData.practicesCount++;

          // Initialize week array
          if (!subData.weeks[w.weekNumber]) subData.weeks[w.weekNumber] = [];

          // Process Grade
          if (l.grade !== "—") {
            const num = parseFloat(l.grade);
            if (!isNaN(num)) {
              // EXCLUDE LECTURES from Valid Grades Calculation if functionality requires
              // But usually if a lecture HAS a grade (unlikely but possible), we count it?
              // The backend sends "0" for missing practice, but "—" for missing lecture.
              // So if we have a number here, it's a real grade (or 0 for cut).
              subData.grades.push(num);
              subData.weeks[w.weekNumber].push(num);
            }
          }
        });
      });
    });

    const processed = Array.from(subs.values()).map(s => {
      const avg = s.grades.length > 0
        ? s.grades.reduce((a, b) => a + b, 0) / s.grades.length
        : 0;

      // Split into Attestations
      const weeks1to8: number[] = [];
      const weeks9to16: number[] = [];

      Object.entries(s.weeks).forEach(([wNum, grades]) => {
        const wn = Number(wNum);
        if (grades.length > 0) {
          const wAvg = grades.reduce((a, b) => a + b, 0) / grades.length;
          if (wn <= 8) weeks1to8.push(wAvg);
          else if (wn <= 16) weeks9to16.push(wAvg);
        }
      });

      const avg1 = weeks1to8.length > 0 ? weeks1to8.reduce((a, b) => a + b, 0) / weeks1to8.length : 0;
      const avg2 = weeks9to16.length > 0 ? weeks9to16.reduce((a, b) => a + b, 0) / weeks9to16.length : 0;

      return {
        ...s,
        average: avg,
        avg1,
        avg2
      };
    });

    return { subjectsData: processed, overallAverage: data.stats.average };
  }, [data]);

  // Set default selected subject
  useEffect(() => {
    if (subjectsData.length > 0 && !selectedSubject) {
      setSelectedSubject(subjectsData[0].name);
    }
  }, [subjectsData]);

  const activeSubject = subjectsData.find(s => s.name === selectedSubject);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        {/* Header Section - ALWAYS VISIBLE */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Баҳоҳои ман</h1>
            <div className="flex items-center gap-3 mt-2">
              <div className="bg-slate-100 p-1 rounded-lg inline-flex">
                <button
                  onClick={() => setSemester(1)}
                  className={cn(
                    "px-4 py-1.5 rounded-md text-sm font-bold transition-all",
                    semester === 1 ? "bg-white text-primary shadow-sm ring-1 ring-black/5" : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  Семестри 1
                </button>
                <button
                  onClick={() => setSemester(2)}
                  className={cn(
                    "px-4 py-1.5 rounded-md text-sm font-bold transition-all",
                    semester === 2 ? "bg-white text-primary shadow-sm ring-1 ring-black/5" : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  Семестри 2
                </button>
              </div>
              <span className="text-sm text-slate-400 font-medium">• {new Date().getFullYear()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Миёнаи умумӣ</span>
              <span className={cn("text-2xl font-bold leading-none mt-0.5", getAverageColorText(overallAverage))}>
                {overallAverage.toFixed(2)}
              </span>
            </div>
            <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
              <TrendingUp className="w-6 h-6 text-slate-400" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex gap-4">
            <Skeleton className="h-32 w-1/4 rounded-2xl" />
            <Skeleton className="h-32 w-1/4 rounded-2xl" />
            <Skeleton className="h-32 w-1/4 rounded-2xl" />
          </div>
        ) : (
          <>
            {/* EMPTY STATE CHECK */}
            {(!data || !subjectsData.length) ? (
              <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-white rounded-3xl border border-dashed border-slate-200">
                <div className="bg-slate-50 p-6 rounded-full mb-6">
                  <BookOpen className="w-16 h-16 text-slate-300" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Баҳоҳо ёфт нашуданд</h2>
                <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                  Дар семестри {semester} ҳанӯз маълумот дастрас нест. <br />
                  Лутфан боварӣ ҳосил кунед, ки семестри дурустро интихоб кардед.
                </p>
              </div>
            ) : (
              <>
                {/* Subjects Grid */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-5 px-1 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Фанҳои ман
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {subjectsData.map((sub) => (
                      <button
                        key={sub.name}
                        onClick={() => setSelectedSubject(sub.name)}
                        className={cn(
                          "relative flex flex-col p-5 rounded-2xl border transition-all duration-300 text-left group overflow-hidden",
                          selectedSubject === sub.name
                            ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200 scale-[1.02] ring-4 ring-blue-50"
                            : "bg-white border-slate-200 hover:border-blue-200 hover:shadow-xl hover:-translate-y-1"
                        )}
                      >
                        {/* Decorative background accent */}
                        <div className={cn(
                          "absolute top-0 right-0 w-24 h-24 bg-gradient-to-br opacity-10 rounded-bl-full transition-all",
                          selectedSubject === sub.name ? "from-white to-white opacity-20" : "from-blue-500 to-purple-600"
                        )} />

                        <div className="flex justify-between items-start w-full mb-4 z-10">
                          <div className="flex gap-2">
                            <span className={cn(
                              "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1",
                              selectedSubject === sub.name ? "bg-white/20 text-white backdrop-blur-sm" : "bg-slate-100 text-slate-500"
                            )}>
                              {sub.practicesCount} Амалӣ
                            </span>
                            {sub.lecturesCount > 0 && (
                              <span className={cn(
                                "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1",
                                selectedSubject === sub.name ? "bg-white/10 text-white/80" : "bg-slate-50 text-slate-400"
                              )}>
                                {sub.lecturesCount} Лексия
                              </span>
                            )}
                          </div>

                          {sub.average > 0 && (
                            <div className={cn(
                              "flex flex-col items-end",
                              selectedSubject === sub.name ? "text-white" : getAverageColorText(sub.average)
                            )}>
                              <span className="text-3xl font-bold tracking-tight leading-none">
                                {sub.average.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>

                        <h4 className={cn(
                          "font-bold text-lg leading-snug line-clamp-2 z-10 mt-auto",
                          selectedSubject === sub.name ? "text-white" : "text-slate-700"
                        )}>
                          {sub.name}
                        </h4>

                        {selectedSubject === sub.name && (
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 pointer-events-none" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Detailed View */}
                {activeSubject && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* Left Column: Stats & Breakdown */}
                    <div className="space-y-6">
                      <Card className="border-0 shadow-lg overflow-hidden">
                        <div className="bg-slate-900 text-white p-6">
                          <h3 className="text-xl font-bold mb-1">Омори фан</h3>
                          <p className="text-slate-400 text-sm">{activeSubject.name}</p>
                        </div>
                        <CardContent className="p-0">
                          <div className="grid grid-cols-2 divide-x divide-y border-b">
                            <div className="p-6 text-center">
                              <span className="block text-3xl font-bold text-slate-800">{activeSubject.avg1.toFixed(1)}</span>
                              <span className="text-xs text-muted-foreground uppercase font-bold mt-1">Рейтинги 1</span>
                            </div>
                            <div className="p-6 text-center">
                              <span className="block text-3xl font-bold text-slate-800">{activeSubject.avg2.toFixed(1)}</span>
                              <span className="text-xs text-muted-foreground uppercase font-bold mt-1">Рейтинги 2</span>
                            </div>
                          </div>
                          <div className="p-6">
                            <div className="flex justify-between text-sm mb-2 font-medium">
                              <span>Пешрафт</span>
                              <span>{Math.min(activeSubject.grades.length * 5, 100)}%</span>
                            </div>
                            <Progress value={Math.min(activeSubject.grades.length * 5, 100)} className="h-2" />
                            <div className="mt-4 flex gap-2 flex-wrap">
                              <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200">
                                {activeSubject.lecturesCount} Лексия
                              </Badge>
                              <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200">
                                {activeSubject.practicesCount} Амалӣ
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Tips Card */}
                      <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-blue-100">
                        <CardContent className="p-6 flex gap-4">
                          <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
                          <div>
                            <h4 className="font-bold text-blue-900 text-sm mb-1">Маълумот</h4>
                            <p className="text-blue-700 text-xs leading-relaxed">
                              Баҳоҳои "0" барои дарсҳои амалӣ ба ҳисоби миёна таъсир мерасонанд. Дарсҳои лексионӣ (бо нишони <span className="font-bold">—</span>) ба рейтинг таъсир намерасонанд.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Right Column: Weeks Table */}
                    <div className="lg:col-span-2 space-y-6">
                      <Tabs defaultValue="all" className="w-full">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            Таърихи дарсҳо
                          </h3>
                          <TabsList>
                            <TabsTrigger value="all">Ҳама</TabsTrigger>
                            <TabsTrigger value="att1">Атт. 1 (1-8)</TabsTrigger>
                            <TabsTrigger value="att2">Атт. 2 (9-16)</TabsTrigger>
                          </TabsList>
                        </div>

                        <TabsContent value="all" className="mt-0">
                          <GradesTable weeks={data.weeks} subject={activeSubject.name} min={1} max={16} />
                        </TabsContent>
                        <TabsContent value="att1" className="mt-0">
                          <GradesTable weeks={data.weeks} subject={activeSubject.name} min={1} max={8} />
                        </TabsContent>
                        <TabsContent value="att2" className="mt-0">
                          <GradesTable weeks={data.weeks} subject={activeSubject.name} min={9} max={16} />
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

// --- SUB COMPONENTS ---

const GradesTable = ({ weeks, subject, min, max }: { weeks: Week[], subject: string, min: number, max: number }) => {
  const filteredWeeks = weeks.filter(w => w.weekNumber >= min && w.weekNumber <= max);

  return (
    <Card className="border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-slate-500 w-20 text-center">Ҳафта</th>
              <th className="p-4 font-semibold text-slate-500">Сана</th>
              <th className="p-4 font-semibold text-slate-500">Намуд</th>
              <th className="p-4 font-semibold text-slate-500 text-center">Баҳо</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredWeeks.map(week => {
              // Find lessons for this subject in this week
              const weekLessons: { date: string, weekday: string, lesson: Lesson }[] = [];
              let practiceSum = 0;
              let practiceCount = 0;

              week.days.forEach(day => {
                day.lessons.forEach(l => {
                  if (l.subject === subject) {
                    weekLessons.push({ date: day.date, weekday: day.weekday, lesson: l });

                    // Calculate for Weekly Average: Exclude Lectures
                    if (l.lessonType !== 'lecture') {
                      const gradeNum = parseFloat(l.grade);
                      if (!isNaN(gradeNum)) {
                        practiceSum += gradeNum;
                      }
                      // Increment count for EVERY practice/lab, even if grade is 0 or missing (which is 0 from backend)
                      // Backend sends "0" for missing practice, so parseFloat("0") is 0.
                      // If it sends "—", parseFloat is NaN. But backend logic ensures "0" for non-lecture.
                      // So we count it.
                      practiceCount++;
                    }
                  }
                });
              });

              const weeklyAverage = practiceCount > 0 ? (practiceSum / practiceCount) : 0;

              if (weekLessons.length === 0) {
                return (
                  <tr key={week.weekNumber} className="bg-slate-50/50">
                    <td className="p-4 text-center font-medium text-slate-400">{week.weekNumber}</td>
                    <td colSpan={3} className="p-4 text-slate-400 italic text-xs">Дарс набуд</td>
                  </tr>
                )
              }

              return (
                <React.Fragment key={week.weekNumber}>
                  {weekLessons.map((item, idx) => (
                    <tr key={`${week.weekNumber}-${idx}`} className="hover:bg-slate-50/50 transition-colors group">
                      {idx === 0 && (
                        <td rowSpan={weekLessons.length + (practiceCount > 0 ? 1 : 0)} className="p-4 text-center font-bold text-slate-700 bg-white border-r align-top">
                          {week.weekNumber}
                        </td>
                      )}
                      <td className="p-4">
                        <div className="font-medium text-slate-800">{item.weekday}</div>
                        <div className="text-xs text-slate-500">{item.date}</div>
                      </td>
                      <td className="p-4">
                        {item.lesson.lessonType === "lecture" ? (
                          <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100">Лексия</Badge>
                        ) : (
                          <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100">Амалӣ</Badge>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <div className={cn(
                          "w-10 h-10 mx-auto rounded-lg flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-110",
                          getGradeColor(item.lesson.lessonType === "lecture" ? "—" : item.lesson.grade)
                          // Ensure lecture always looks greyish if logic missed it, though backend handles it now.
                        )}>
                          {item.lesson.lessonType === "lecture" ? "—" : item.lesson.grade}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {/* Weekly Summary Row */}
                  {practiceCount > 0 && (
                    <tr className="bg-slate-100/50 border-t border-dashed">
                      <td colSpan={2} className="p-3 text-right font-medium text-slate-500 text-xs uppercase tracking-wider">
                        Натиҷаи ҳафта ({practiceCount} дарс):
                      </td>
                      <td className="p-3 text-center">
                        <Badge className={cn("text-sm px-3 py-1",
                          weeklyAverage >= 4.5 ? "bg-emerald-500 hover:bg-emerald-600" :
                            weeklyAverage >= 3.0 ? "bg-blue-500 hover:bg-blue-600" : "bg-rose-500 hover:bg-rose-600"
                        )}>
                          {weeklyAverage.toFixed(2)}
                        </Badge>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card >
  )
}