// src/pages/admin/AdminWeeklyGradePage.tsx
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import axios from "axios";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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

const getGradeDisplay = (grade: number) => {
  return grade === 0 ? "—" : grade.toFixed(1);
};

const getInitials = (name: string) => {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
};

export default function AdminWeeklyGradePage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [data, setData] = useState<GradebookData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [openStudents, setOpenStudents] = useState<string[]>([]);

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
  }, [selectedGroup]);

  // Ҳисоби миёнаи фан – фақат барои семестри ҷорӣ (16 ҳафта аз оғози семестр)
  const subjectStudent16Weeks = React.useMemo(() => {
    if (!selectedSubject || !data) return [];

    const now = new Date();
    const currentYear = now.getFullYear();

    // Оғози семестри 1
    const firstSemesterStart = new Date(currentYear, 8, 1); // 1 сентябр

    // Оғози семестри 2
    const secondSemesterStart = new Date(currentYear + 1, 1, 1); // 1 феврал

    // Муайян кардани семестри ҷорӣ
    const isSecondSemester = now >= secondSemesterStart;
    const currentSemesterStart:any = isSecondSemester ? secondSemesterStart : firstSemesterStart;

    const lessonCounts = data.weeklyLessonCounts?.[selectedSubject] || {};
    const expectedCounts = Array(16).fill(0);
    for (let w = 1; w <= 16; w++) {
      expectedCounts[w - 1] = lessonCounts[w] || 0;
    }

    return data.students.map((student) => {
      const weeklySums = Array(16).fill(0);
      const weeklyActualCounts = Array(16).fill(0);

      student.grades.forEach((day) => {
        // Рӯзи якшанбе ҳисоб накунем
        const [dd, mm] = day.date.split('.').map(Number);
        const dayYear = mm < 9 ? currentYear : currentYear + 1;
        const dayDate:any = new Date(dayYear, mm - 1, dd);
        if (dayDate.getDay() === 0) return; // Sunday

        // Фақат рӯзҳои семестри ҷорӣ
        if (dayDate < currentSemesterStart) return;

        const diffDays = Math.floor((dayDate - currentSemesterStart) / (1000 * 60 * 60 * 24));
        let weekIndex = Math.floor(diffDays / 7);

        if (weekIndex < 0 || weekIndex >= 16) return;

        day.lessons.forEach((lesson) => {
          if (lesson.subjectId === selectedSubject) {
            const grade = lesson.taskGrade ?? lesson.preparationGrade ?? 0;
            weeklySums[weekIndex] += grade;
            weeklyActualCounts[weekIndex] += 1;
          }
        });
      });

      const weeklyAverages = weeklySums.map((sum, i) => {
        const expected = expectedCounts[i];
        if (expected > 0) {
          return Number((sum / expected).toFixed(2));
        }
        return weeklyActualCounts[i] > 0 ? Number((sum / weeklyActualCounts[i]).toFixed(2)) : 0;
      });

      const first8Avg = weeklyAverages.slice(0, 8).reduce((a, b) => a + b, 0) / 8;
      const next8Avg = weeklyAverages.slice(8, 16).reduce((a, b) => a + b, 0) / 8;
      const totalAvg = Number(((first8Avg + next8Avg) / 2).toFixed(2));

      return {
        fullName: student.fullName,
        weeklyAverages,
        weeklyExpectedCounts: expectedCounts,
        totalAvg,
        isSecondSemester,
      };
    });
  }, [selectedSubject, data]);

  const toggleStudent = (fullName: string) => {
    setOpenStudents((prev) =>
      prev.includes(fullName) ? prev.filter((n) => n !== fullName) : [...prev, fullName]
    );
  };

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

  // Муайян кардани номи семестр барои UI
  const now = new Date();
  const currentYear = now.getFullYear();
  const secondSemesterStart = new Date(currentYear + 1, 1, 1);
  const isSecondSemester = now >= secondSemesterStart;
  const currentSemesterName = isSecondSemester ? "Семестри 2 (аз 1 феврал)" : "Семестри 1 (аз 1 сентябр)";

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
                  <SelectItem key={g._id} value={g._id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="weekly" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="weekly">Ҳафтагӣ</TabsTrigger>
            <TabsTrigger value="subjects">Баҳоҳо барои фанҳо</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly">
            {loading ? (
              <Skeleton className="h-96 w-full rounded-xl" />
            ) : data && data.students.length > 0 ? (
              <Accordion type="single" collapsible className="space-y-4">
                {Array.from(
                  new Set(
                    data.students[0].grades
                      .map((g) => g.weekNumber)
                      .filter((wn): wn is number => wn != null)
                  )
                )
                  .sort((a, b) => a - b)
                  .map((weekNum) => (
                    <AccordionItem key={weekNum} value={`week-${weekNum}`}>
                      <AccordionTrigger className="text-lg font-semibold">
                        Ҳафтаи {weekNum}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-max">
                            <thead>
                              <tr className="bg-muted">
                                <th className="p-4 text-left sticky left-0 bg-muted z-10 min-w-[240px]">
                                  Донишҷӯ
                                </th>
                                {data.students[0].grades
                                  .filter((g) => g.weekNumber === weekNum)
                                  .map((day) => (
                                    <th
                                      key={day.date}
                                      colSpan={6}
                                      className="p-4 text-center border-l"
                                    >
                                      {day.weekday}
                                      <br />
                                      <span className="text-sm opacity-80">{day.date}</span>
                                    </th>
                                  ))}
                              </tr>
                              <tr className="bg-muted/50">
                                <th className="sticky left-0 bg-muted/50 z-10"></th>
                                {data.students[0].grades
                                  .filter((g) => g.weekNumber === weekNum)
                                  .map(() =>
                                    [1, 2, 3, 4, 5, 6].map((l) => (
                                      <th
                                        key={l}
                                        className="p-3 text-center text-sm border-l"
                                      >
                                        L{l}
                                      </th>
                                    ))
                                  )}
                              </tr>
                            </thead>
                            <tbody>
                              {data.students.map((student) => (
                                <tr key={student._id} className="border-b hover:bg-muted/50">
                                  <td className="p-4 sticky left-0 bg-card z-10">
                                    <div className="flex items-center gap-3">
                                      <Avatar>
                                        <AvatarFallback>
                                          {getInitials(student.fullName)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="font-medium">{student.fullName}</span>
                                    </div>
                                  </td>
                                  {student.grades
                                    .filter((g) => g.weekNumber === weekNum)
                                    .map((day) =>
                                      day.lessons.map((lesson, i) => {
                                        const grade = lesson.taskGrade ?? lesson.preparationGrade ?? 0;
                                        return (
                                          <td key={i} className="p-2 text-center border-l">
                                            <div
                                              className={cn(
                                                "w-10 h-10 mx-auto rounded-xl flex items-center justify-center text-sm font-bold",
                                                getGradeStyle(grade)
                                              )}
                                            >
                                              {getGradeDisplay(grade)}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                              {lesson.subjectName || "—"}
                                            </p>
                                          </td>
                                        );
                                      })
                                    )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
              </Accordion>
            ) : (
              <Card className="p-20 text-center">
                <p className="text-xl text-muted-foreground">Маълумот нест</p>
              </Card>
            )}
          </TabsContent>

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
              ) : selectedSubject && data ? (
                <Card className="shadow-2xl">
                  <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <BookOpen className="w-8 h-8" />
                      {data.subjects.find((s) => s._id === selectedSubject)?.name} — {currentSemesterName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-8">
                    <div className="space-y-4">
                      {subjectStudent16Weeks.map((sg) => {
                        const isOpen = openStudents.includes(sg.fullName);
                        return (
                          <Card key={sg.fullName} className="overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5 flex justify-between items-center cursor-pointer"
                              onClick={() => toggleStudent(sg.fullName)}
                            >
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarFallback>{getInitials(sg.fullName)}</AvatarFallback>
                                </Avatar>
                                <h3 className="text-xl font-bold">{sg.fullName}</h3>
                              </div>
                              <div className="flex items-center gap-4">
                                <div
                                  className={cn(
                                    "px-6 py-2 rounded-xl font-bold text-lg",
                                    getAverageStyle(sg.totalAvg)
                                  )}
                                >
                                  Миёнаи семестр: {sg.totalAvg.toFixed(2)}
                                </div>
                                {isOpen ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                              </div>
                            </div>
                            {isOpen && (
                              <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                  <table className="w-full">
                                    <thead>
                                      <tr className="bg-gray-100">
                                        <th className="p-4 text-left font-medium">Ҳафта</th>
                                        <th className="p-4 text-center font-medium">Миёнаи ҳафтагӣ</th>
                                        <th className="p-4 text-center font-medium">Шумораи дарсҳо</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {sg.weeklyAverages.map((avg, i) => (
                                        <tr key={i} className="border-b hover:bg-gray-50">
                                          <td className="p-4">Ҳафтаи {i + 1}</td>
                                          <td className="p-4 text-center">
                                            <div
                                              className={cn(
                                                "w-14 h-14 mx-auto rounded-xl flex items-center justify-center text-xl font-bold",
                                                getGradeStyle(avg)
                                              )}
                                            >
                                              {avg > 0 ? avg.toFixed(1) : "0.0"}
                                            </div>
                                          </td>
                                          <td className="p-4 text-center font-medium text-muted-foreground">
                                            {sg.weeklyExpectedCounts[i]}
                                          </td>
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