// src/pages/student/MyGradesPage.tsx
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronUp, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

export default function MyGradesPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openWeeks, setOpenWeeks] = useState<number[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [subjectGrades, setSubjectGrades] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    first8: { total: 0, count: 0, average: 0 },
    next8: { total: 0, count: 0, average: 0 },
    overall: { total: 0, count: 0, average: 0 },
  });
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (user?.role !== "student") return;
    setLoading(true);
    axios
      .get(`${apiUrl}/journal/my-grades`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (data?.weeks?.length > 0) {
      setOpenWeeks(data.weeks.map((w: any) => w.weekNumber));
      const uniqueSubs = new Set<string>();
      data.weeks.forEach((w: any) =>
        w.days.forEach((d: any) =>
          d.lessons.forEach((l: any) => {
            if (l.subject && l.subject !== "—") uniqueSubs.add(l.subject);
          })
        )
      );
      setSubjects(Array.from(uniqueSubs));
    }
  }, [data]);

  useEffect(() => {
    if (selectedSubject && data) {
      const gradesByWeek: any[] = Array.from({ length: 16 }, (_, i) => ({
        weekNumber: i + 1,
        grades: [],
        average: 0,
      }));

      let first8Total = 0, first8Count = 0;
      let next8Total = 0, next8Count = 0;

      data.weeks.forEach((w: any) => {
        if (w.weekNumber > 16) return;
        const weekIndex = w.weekNumber - 1;
        w.days.forEach((d: any) =>
          d.lessons.forEach((l: any) => {
            if (l.subject === selectedSubject && l.grade !== "—") {
              const num = parseFloat(l.grade);
              if (!isNaN(num)) {
                gradesByWeek[weekIndex].grades.push(num);
                if (w.weekNumber <= 8) {
                  first8Total += num;
                  first8Count++;
                } else {
                  next8Total += num;
                  next8Count++;
                }
              }
            }
          })
        );
      });

      gradesByWeek.forEach((week) => {
        if (week.grades.length > 0) {
          week.average = Math.round((week.grades.reduce((a: number, b: number) => a + b, 0) / week.grades.length) * 10) / 10;
        } else {
          week.average = 0;
        }
      });

      const overallTotal = first8Total + next8Total;
      const overallCount = first8Count + next8Count;
      const overallAvg = overallCount > 0 ? Math.round((overallTotal / overallCount) * 10) / 10 : 0;

      setSubjectGrades(gradesByWeek);
      setSummary({
        first8: { total: first8Total, count: first8Count, average: first8Count > 0 ? Math.round((first8Total / first8Count) * 10) / 10 : 0 },
        next8: { total: next8Total, count: next8Count, average: next8Count > 0 ? Math.round((next8Total / next8Count) * 10) / 10 : 0 },
        overall: { total: overallTotal, count: overallCount, average: overallAvg },
      });
    } else {
      setSubjectGrades([]);
      setSummary({
        first8: { total: 0, count: 0, average: 0 },
        next8: { total: 0, count: 0, average: 0 },
        overall: { total: 0, count: 0, average: 0 },
      });
    }
  }, [selectedSubject, data]);

  const getAverageColor = (avg: number) => {
    if (avg < 2.5) return "text-rose-600 bg-rose-100";
    if (avg <= 3.0) return "text-amber-600 bg-amber-100";
    if (avg <= 4.0) return "text-emerald-600 bg-emerald-100";
    return "text-green-800 bg-green-100";
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!data || data.weeks.length === 0) {
    return (
      <DashboardLayout>
        <div className="p-16 text-center space-y-4">
          <TrendingUp className="w-20 h-20 mx-auto text-muted-foreground/40" />
          <h2 className="text-3xl font-bold">Ҳанӯз баҳо нест</h2>
          <p className="text-lg text-muted-foreground">
            Баҳоҳо ҳанӯз сабт нашудаанд ё семестр оғоз нашудааст
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const { weeks, stats } = data;

  const getGradeColor = (grade: string) => {
    if (grade === "—") return "bg-gray-200 text-gray-500";
    const num = parseFloat(grade);
    if (num >= 4.5) return "bg-emerald-500 text-white";
    if (num >= 3.5) return "bg-blue-500 text-white";
    if (num >= 3) return "bg-amber-500 text-white";
    return "bg-rose-500 text-white";
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Баҳоҳои ман"
        description="Аз 1 сентябр то имрӯз — пешрафти шумо"
      />

      {/* Stats умумӣ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold">{stats.average || "0.0"}</div>
            <p className="text-sm mt-2 opacity-90">Миёнаи умумӣ</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground mt-2">Ҷамъи баҳоҳо</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-emerald-600">{stats.maxGrade || 0}</div>
            <p className="text-sm text-muted-foreground mt-2">Беҳтарин баҳо</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-rose-600">{stats.minGrade || 0}</div>
            <p className="text-sm text-muted-foreground mt-2">Пасттарин баҳо</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-10 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-center">
            <span>Пешрафт</span>
            <span className="text-2xl font-bold text-primary">
              {stats.average || "0.0"}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress
            value={(stats.average || 0) * 20}
            className="h-4 bg-gray-200 rounded-full [&>div]:bg-gradient-to-r [&>div]:from-indigo-500 [&>div]:to-purple-600"
          />
        </CardContent>
      </Card>

      {/* Селект барои фанҳо */}
      <Card className="mb-10 shadow-lg">
        <CardHeader>
          <CardTitle>Интихоби фан</CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={(value) => setSelectedSubject(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Фанро интихоб кунед" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((sub) => (
                <SelectItem key={sub} value={sub}>
                  {sub}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Summary барои 8+8+16 */}
      {selectedSubject && (
        <Card className="mb-10 shadow-lg">
          <CardHeader>
            <CardTitle>Ҳисоби умумӣ барои фан: {selectedSubject}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-6 rounded-xl text-center ${getAverageColor(summary.first8.average)}`}>
                <h3 className="text-lg font-bold">8 ҳафтаи аввал</h3>
                <div className="text-4xl font-bold mt-2">{summary.first8.average.toFixed(1)}</div>
                <p className="text-sm mt-1">({summary.first8.count} баҳо)</p>
              </div>
              <div className={`p-6 rounded-xl text-center ${getAverageColor(summary.next8.average)}`}>
                <h3 className="text-lg font-bold">8 ҳафтаи дигар</h3>
                <div className="text-4xl font-bold mt-2">{summary.next8.average.toFixed(1)}</div>
                <p className="text-sm mt-1">({summary.next8.count} баҳо)</p>
              </div>
              <div className={`p-6 rounded-xl text-center ${getAverageColor(summary.overall.average)}`}>
                <h3 className="text-lg font-bold">Тотал (16 ҳафта)</h3>
                <div className="text-4xl font-bold mt-2">{summary.overall.average.toFixed(1)}</div>
                <p className="text-sm mt-1">({summary.overall.count} баҳо)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ҷадвал барои ҳафтаҳо */}
      {selectedSubject && (
        <Card className="mb-10 shadow-lg">
          <CardHeader>
            <CardTitle>Баҳоҳо барои фан: {selectedSubject}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="p-3 text-left">Ҳафта</th>
                    <th className="p-3 text-center">Баҳоҳо</th>
                    <th className="p-3 text-center">Миёна</th>
                  </tr>
                </thead>
                <tbody>
                  {subjectGrades.map((week: any) => (
                    <tr key={week.weekNumber} className="border-b hover:bg-gray-50">
                      <td className="p-3">Ҳафтаи {week.weekNumber}</td>
                      <td className="p-3 text-center">
                        {week.grades.length > 0 ? week.grades.join(", ") : "—"}
                      </td>
                      <td className="p-3 text-center font-bold">
                        {week.average}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ҳафтаҳои умумӣ */}
      <div className="space-y-4">
        {weeks.map((week: any) => {
          const isOpen = openWeeks.includes(week.weekNumber);
          return (
            <Card
              key={week.weekNumber}
              className="shadow-xl overflow-hidden border-0"
            >
              <div
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5 flex justify-between items-center cursor-pointer"
                onClick={() =>
                  setOpenWeeks(
                    isOpen
                      ? openWeeks.filter((w) => w !== week.weekNumber)
                      : [...openWeeks, week.weekNumber]
                  )
                }
              >
                <h3 className="text-xl font-bold">
                  Ҳафтаи {week.weekNumber} ({week.weekStart} — {week.weekEnd})
                </h3>
                {isOpen ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
              </div>
              {isOpen && (
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] text-sm">
                      <thead>
                        <tr className="bg-gray-100 border-b">
                          <th className="p-3 text-left font-semibold sticky left-0 bg-gray-100 z-10">
                            Рӯз
                          </th>
                          <th className="p-3 text-center font-semibold">L1</th>
                          <th className="p-3 text-center font-semibold">L2</th>
                          <th className="p-3 text-center font-semibold">L3</th>
                          <th className="p-3 text-center font-semibold">L4</th>
                          <th className="p-3 text-center font-semibold">L5</th>
                          <th className="p-3 text-center font-semibold">L6</th>
                        </tr>
                      </thead>
                      <tbody>
                        {week.days.map((day: any) => (
                          <tr
                            key={day.date}
                            className="border-b hover:bg-gray-50 transition-colors"
                          >
                            <td className="p-3 font-medium sticky left-0 bg-white z-10">
                              {day.weekday} ({day.date})
                            </td>
                            {day.lessons.map((lesson: { grade: string; subject: string }, i: number) => (
                              <td key={i} className="p-2 text-center">
                                <div
                                  className={cn(
                                    "w-10 h-10 mx-auto rounded-xl flex items-center justify-center text-lg font-bold shadow-md transition-transform hover:scale-105",
                                    getGradeColor(lesson.grade)
                                  )}
                                >
                                  {lesson.grade}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {lesson.subject}
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </DashboardLayout>
  );
}