// src/pages/admin/AdminWeeklyGradePage.tsx — ДУ НАМУД ДАР ЯК САҲИФА: ҲАФТАГӢ + АДЕЛНИ ФАНҲО
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, GraduationCap, Users, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import axios from "axios";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface GradeRecord {
  attendance: "present" | "absent" | "late" | null;
  preparationGrade: number | null;
  taskGrade: number | null;
  subjectId?: string;
  subjectName?: string;
}

interface DayGrades {
  date: string;
  weekday: string;
  lessons: GradeRecord[];
}

interface Student {
  _id: string;
  fullName: string;
  grades: DayGrades[];
}

interface WeekDay {
  date: string;
  weekday: string;
}

interface Subject {
  _id: string;
  name: string;
}

interface GradebookData {
  groupName: string;
  weekNumber: number;
  weekStart: string;
  weekEnd: string;
  days: WeekDay[];
  students: Student[];
  subjects: Subject[];
}

interface Group {
  _id: string;
  name: string;
}

const getGradeStyle = (grade: number | null) => {
  if (grade === null) return "bg-gray-200 text-gray-600";
  if (grade === 5) return "bg-green-500 text-white shadow-lg";
  if (grade === 4) return "bg-orange-500 text-white shadow-lg";
  if (grade === 3) return "bg-yellow-500 text-white shadow-lg";
  if (grade === 2) return "bg-red-500 text-white shadow-lg";
  return "bg-red-700 text-white shadow-lg";
};

const getGradeDisplay = (record: GradeRecord) => {
  const grade = record.taskGrade ?? record.preparationGrade;
  return grade === null ? "—" : grade.toString();
};

const getInitials = (name: string) => {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
};

export default function AdminWeeklyGradePage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [data, setData] = useState<GradebookData | null>(null);
  const [loading, setLoading] = useState(false);
  const [week, setWeek] = useState(1);
  const [selectedSubject, setSelectedSubject] = useState("");

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
        `${apiUrl}/journal/weekly-grades/${selectedGroup}?week=${week}`,
        { headers: { Authorization: `Bearer ${token}` } }
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
  }, [selectedGroup, week]);

  // Ҳисоби баҳоҳо барои фани интихобшуда
  const subjectStudentGrades = selectedSubject && data ? (() => {
    const studentMap = new Map<string, { fullName: string; weekly: (string | null)[] }>();

    data.students.forEach((student) => {
      const weekly = Array(16).fill(null); // Ҳафтаҳои 1 то 16

      student.grades.forEach((day, dayIdx) => {
        const currentWeek = week + Math.floor(dayIdx / 6);
        if (currentWeek > 16) return;

        day.lessons.forEach((lesson) => {
          if (lesson.subjectId === selectedSubject) {
            const grade = lesson.taskGrade ?? lesson.preparationGrade;
            if (grade !== null && weekly[currentWeek - 1] === null) {
              weekly[currentWeek - 1] = grade.toString();
            }
          }
        });
      });

      studentMap.set(student._id, {
        fullName: student.fullName,
        weekly,
      });
    });

    return Array.from(studentMap.values());
  })() : [];

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
                  <SelectItem key={g._id} value={g._id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <GraduationCap className="w-8 h-8" />
              {data?.groupName}
            </h1>
            <p className="text-lg text-muted-foreground">
              {data?.weekStart} — {data?.weekEnd} (Ҳафтаи {data?.weekNumber})
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {groups.map((g) => (
                  <SelectItem key={g._id} value={g._id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 bg-muted rounded-lg p-2">
              <Button variant="ghost" size="sm" onClick={() => setWeek(Math.max(1, week - 1))}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <span className="px-4 font-medium">Ҳафтаи {week}</span>
              <Button variant="ghost" size="sm" onClick={() => setWeek(Math.min(16, week + 1))}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="weekly" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="weekly">Намуди ҳафтагӣ</TabsTrigger>
            <TabsTrigger value="subjects">Аделни ҳар фан</TabsTrigger>
          </TabsList>

          {/* Намуди ҳафтагӣ */}
          <TabsContent value="weekly">
            {loading ? (
              <Skeleton className="h-96 w-full rounded-xl" />
            ) : (
              <Card className="overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-max">
                    <thead>
                      <tr className="bg-muted">
                        <th className="p-4 text-left sticky left-0 bg-muted z-10 min-w-[220px]">Донишҷӯ</th>
                        {data?.days.map((day) => (
                          <th key={day.date} colSpan={6} className="p-4 text-center">
                            {day.weekday}<br />
                            <span className="text-sm opacity-80">{day.date}</span>
                          </th>
                        ))}
                      </tr>
                      <tr className="bg-muted/50">
                        <th className="sticky left-0 bg-muted/50 z-10"></th>
                        {data?.days.map(() => [1, 2, 3, 4, 5, 6].map((l) => (
                          <th key={l} className="p-3 text-center text-sm">L{l}</th>
                        )))}
                      </tr>
                    </thead>
                    <tbody>
                      {data?.students.map((student) => (
                        <tr key={student._id} className="border-b hover:bg-muted/50">
                          <td className="p-4 sticky left-0 bg-card z-10">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback>{getInitials(student.fullName)}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{student.fullName}</span>
                            </div>
                          </td>
                          {student.grades.map((day) => day.lessons.map((lesson, i) => (
                            <td key={i} className="p-2 text-center">
                              <div className={cn("w-10 h-10 mx-auto rounded-xl flex items-center justify-center text-sm font-bold", getGradeStyle(lesson.taskGrade ?? lesson.preparationGrade))}>
                                {getGradeDisplay(lesson)}
                              </div>
                            </td>
                          )))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Намуди аделни ҳар фан */}
          <TabsContent value="subjects">
            <div className="space-y-6">
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-full md:w-96">
                  <SelectValue placeholder="Фанро интихоб кунед..." />
                </SelectTrigger>
                <SelectContent>
                  {data?.subjects?.map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {loading ? (
                <Skeleton className="h-96 w-full rounded-xl" />
              ) : selectedSubject ? (
                <Card className="shadow-2xl">
                  <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <BookOpen className="w-8 h-8" />
                      {data?.subjects.find((s) => s._id === selectedSubject)?.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-8">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-muted">
                            <th className="p-4 text-left sticky left-0 bg-muted z-10 min-w-[220px]">Донишҷӯ</th>
                            {Array.from({ length: 16 }, (_, i) => i + 1).map((w) => (
                              <th key={w} className="p-4 text-center">
                                Ҳафтаи {w}
                              </th>
                            ))}
                            <th className="p-4 text-center">Миёна</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subjectStudentGrades.map((sg) => {
                            const grades = sg.weekly;
                            const validGrades = grades.filter((g) => g !== null) as string[];
                            const average = validGrades.length > 0
                              ? (validGrades.reduce((a, b) => a + parseFloat(b), 0) / validGrades.length).toFixed(2)
                              : "—";

                            return (
                              <tr key={sg.fullName} className="border-b hover:bg-muted/50">
                                <td className="p-4 sticky left-0 bg-card z-10">
                                  <div className="flex items-center gap-3">
                                    <Avatar>
                                      <AvatarFallback>{getInitials(sg.fullName)}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{sg.fullName}</span>
                                  </div>
                                </td>
                                {grades.map((g, i) => (
                                  <td key={i} className="p-4 text-center">
                                    <div className={cn("w-12 h-12 mx-auto rounded-xl flex items-center justify-center text-lg font-bold", getGradeStyle(g ? parseFloat(g) : null))}>
                                      {g || "—"}
                                    </div>
                                  </td>
                                ))}
                                <td className="p-4 text-center">
                                  <Badge variant="secondary" className="text-xl px-6 py-3">
                                    {average}
                                  </Badge>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="p-20 text-center">
                  <BookOpen className="w-20 h-20 mx-auto mb-6 text-muted-foreground/50" />
                  <p className="text-xl text-muted-foreground">Фанро интихоб кунед</p>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}