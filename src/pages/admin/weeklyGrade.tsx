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
  // Memoize internal derived values if needed, but styling is fast.
  const gradientClass = useMemo(() => getGradient(data.totalAvg), [data.totalAvg]);
  const shadowClass = useMemo(() => getShadow(data.totalAvg), [data.totalAvg]);
  const initials = useMemo(() => getInitials(data.fullName), [data.fullName]);

  return (
    <div
      className={cn(
        "group relative bg-card rounded-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer shadow-lg hover:shadow-2xl",
        shadowClass
      )}
      onClick={() => onClick(data)}
    >
      {/* Header */}
      <div className={cn("h-24 w-full rounded-t-2xl relative overflow-hidden", gradientClass)}>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mixed-blend-overlay" />
        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white font-bold px-3 py-1 rounded-lg border border-white/20 shadow-sm text-sm">
          {data.totalAvg > 0 ? data.totalAvg.toFixed(2) : "N/A"}
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

        {/* Chart - Optimized to reduce excessive DOM depth if possible */}
        <div className="space-y-2">
          <div className="flex items-end justify-between h-8 gap-[3px] px-1">
            {data.weeklyAverages.map((avg: number, idx: number) => {
              const height = avg > 0 ? Math.max((avg / 5) * 100, 15) : 10;
              const barColor = avg === 0 ? "bg-muted" :
                avg >= 4.5 ? "bg-emerald-400" :
                  avg >= 3.5 ? "bg-blue-400" :
                    avg >= 3.0 ? "bg-amber-400" : "bg-rose-400";
              return (
                <div
                  key={idx}
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

// 2. Memoized Student Modal
const StudentModal = memo(({ student, subjectName, onClose }: { student: any, subjectName: string, onClose: () => void }) => {
  if (!student) return null;

  const initials = getInitials(student.fullName);
  const totalAvgClass = getAverageStyle(student.totalAvg);
  const semester1Avg = (student.weeklyAverages.slice(0, 8).reduce((a: number, b: number) => a + b, 0) / 8).toFixed(2);
  const semester2Avg = (student.weeklyAverages.slice(8, 16).reduce((a: number, b: number) => a + b, 0) / 8).toFixed(2);

  return (
    <Dialog open={!!student} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl overflow-hidden p-0 border-0 shadow-2xl bg-card/95 backdrop-blur-xl">
        <DialogHeader className="p-6 pb-2 border-b bg-muted/10 hidden">
          {/* Hidden accessible header */}
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

        {/* Stat Cards */}
        <div className="-mt-8 px-8 grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {[
            { label: "Миёна (8 ҳаф. 1-ум)", value: semester1Avg, color: "bg-blue-500" },
            { label: "Миёна (8 ҳаф. 2-юм)", value: semester2Avg, color: "bg-purple-500" },
            { label: "Умумӣ", value: student.totalAvg.toFixed(2), color: student.totalAvg >= 3 ? "bg-emerald-500" : "bg-rose-500" },
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
            Таърихи пешрафт
          </h4>
          <div className="rounded-xl border bg-card/50 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="p-4 text-left font-semibold text-muted-foreground w-1/3">Ҳафта</th>
                  <th className="p-4 text-center font-semibold text-muted-foreground">Баҳо</th>
                  <th className="p-4 text-right font-semibold text-muted-foreground">Статус</th>
                </tr>
              </thead>
              <tbody>
                {student.weeklyAverages.map((avg: number, i: number) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="p-4 font-medium">Ҳафтаи {i + 1}</td>
                    <td className="p-4 text-center">
                      {avg > 0 ? (
                        <span className={cn("font-bold text-lg",
                          avg >= 4.5 ? "text-emerald-600" :
                            avg >= 3.5 ? "text-blue-600" :
                              avg >= 3 ? "text-amber-600" : "text-rose-600"
                        )}>{avg.toFixed(1)}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {avg >= 4.5 ? <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0">Аъло</Badge> :
                        avg >= 3.5 ? <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0">Хуб</Badge> :
                          avg >= 3 ? <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-0">Миёна</Badge> :
                            avg > 0 ? <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 border-0">Бад</Badge> :
                              <Badge variant="outline" className="text-muted-foreground border-dashed">Нест</Badge>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
});

// 3. Memoized Weekly List (Detailed Accordion)
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
                      <span className={cn("font-bold", student.totalAvg >= 3 ? "text-emerald-600" : "text-rose-600")}>
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
                        const prep = l.preparationGrade ? Number(l.preparationGrade) : 0;
                        const task = l.taskGrade ? Number(l.taskGrade) : 0;

                        // ───────────────────────────────
                        // ИСЛОҲИ АСОСӢ: ҲАМЕША ба 2 тақсим мекунем
                        const lessonGrade = (prep + task) / 2;
                        // ───────────────────────────────

                        if (lessonGrade > 0) gradesInWeek.push(lessonGrade);
                      }
                    });
                  });

                  return (
                    <div key={weekNum} className="flex flex-col p-3 rounded-lg bg-muted/30 border relative">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] uppercase text-muted-foreground font-bold">Ҳафтаи {weekNum}</span>
                        {avg > 0 && (
                          <Badge variant="outline" className={cn("text-[10px] h-5 px-1",
                            avg >= 4.5 ? "text-emerald-600 border-emerald-200 bg-emerald-50" :
                              avg >= 3.0 ? "text-blue-600 border-blue-200 bg-blue-50" : "text-rose-600 border-rose-200 bg-rose-50"
                          )}>
                            Avg: {avg.toFixed(1)}
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

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    axios.get(`${apiUrl}/groups`).then((res) => setGroups(res.data)).catch(console.error);
  }, [apiUrl]);

  const fetchData = async () => {
    if (!selectedGroup) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${apiUrl}/journal/weekly-grades/${selectedGroup}`,
        {
          params: { subjectId: selectedSubject || undefined },
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
  }, [selectedGroup, selectedSubject]);

  // OPTIMIZED CALCULATION
  const subjectStudent16Weeks = useMemo(() => {
    if (!selectedSubject || !data) return [];

    const lessonCounts = data.weeklyLessonCounts?.[selectedSubject] || {};
    const expectedCounts = Array(16).fill(0);
    for (let w = 1; w <= 16; w++) {
      expectedCounts[w - 1] = lessonCounts[w] || 0;
    }

    return data.students.map((student) => {
      const weeklySums = new Float32Array(16);
      const weeklyActualCounts = new Int8Array(16);

      const grades = student.grades;
      const len = grades.length;

      for (let i = 0; i < len; i++) {
        const day = grades[i];
        const weekNum = day.weekNumber;
        if (!weekNum || weekNum < 1 || weekNum > 16) continue;

        const weekIndex = weekNum - 1;
        const lessons = day.lessons;

        for (let l = 0; l < lessons.length; l++) {
          const lesson = lessons[l];

          // lecture-ҳоро ҳисоб намекунем
          if (lesson.lessonType === "lecture") continue;

          if (lesson.subjectId && String(lesson.subjectId) === String(selectedSubject)) {
            const prep = lesson.preparationGrade ? Number(lesson.preparationGrade) : 0;
            const task = lesson.taskGrade ? Number(lesson.taskGrade) : 0;

            // ───────────────────────────────
            // ИСЛОҲИ АСОСӢ: ҲАМЕША ба 2 тақсим мекунем
            const lessonGrade = (prep + task) / 2;
            // ───────────────────────────────

            if (lessonGrade > 0) {
              weeklySums[weekIndex] += lessonGrade;
              weeklyActualCounts[weekIndex]++;
            }
          }
        }
      }

      const weeklyAverages = Array.from(weeklySums).map((sum, i) => {
        const count = weeklyActualCounts[i];
        return count > 0 ? Number((sum / count).toFixed(2)) : 0;
      });

      const first8Avg = weeklyAverages.slice(0, 8).reduce((a, b) => a + b, 0) / 8;
      const next8Avg = weeklyAverages.slice(8, 16).reduce((a, b) => a + b, 0) / 8;
      const totalAvg = Number(((first8Avg + next8Avg) / 2).toFixed(2));

      return {
        fullName: student.fullName,
        weeklyAverages,
        weeklyExpectedCounts: expectedCounts,
        totalAvg,
        gradesRaw: grades // барои намоиши тафсилотӣ
      };
    });
  }, [selectedSubject, data]);

  // Rest of component callbacks...
  const handleCardClick = React.useCallback((student: any) => {
    setSelectedStudentDetails(student);
  }, []);

  const handleCloseModal = React.useCallback(() => {
    setSelectedStudentDetails(null);
  }, []);

  if (!selectedGroup) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center p-6">
          <Card className="w-full max-w-xl p-12 text-center shadow-2xl border-0">
            <GraduationCap className="w-24 h-24 mx-auto mb-8 text-primary" />
            <h1 className="text-3xl font-bold mb-4">Баҳоҳои ҳафтагӣ</h1>
            <p className="text-muted-foreground mb-8">Гурӯҳро интихоб кунед</p>
            <Select onValueChange={setSelectedGroup}>
              <SelectTrigger className="w-full text-lg py-6">
                <SelectValue placeholder="Гурӯҳро интихоб кунед..." />
              </SelectTrigger>
              <SelectContent>
                {groups.map((g) => (
                  <SelectItem key={g._id} value={g._id}>{g.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  const currentSemesterName = new Date().getMonth() >= 8 || new Date().getMonth() < 1
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
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Гурӯҳ" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((g) => (
                  <SelectItem key={g._id} value={g._id}>{g.name}</SelectItem>
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

                  <StudentModal
                    student={selectedStudentDetails}
                    subjectName={data.subjects.find((s) => s._id === selectedSubject)?.name || ""}
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