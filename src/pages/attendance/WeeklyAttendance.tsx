import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  CalendarDays,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

type AttendanceStatus = "present" | "absent" | "late" | null;

interface DayAttendance {
  date: string;
  weekday: string;
  lessons: AttendanceStatus[];
}

interface Student {
  _id: string;
  fullName: string;
  attendance: DayAttendance[];
}

interface WeekDay {
  date: string;
  weekday: string;
}

interface AttendanceData {
  groupName: string;
  weekNumber: number;
  weekStart: string;
  weekEnd: string;
  days: WeekDay[];
  students: Student[];
}

interface Group {
  _id: string;
  name: string;
}

const getStatusStyle = (status: AttendanceStatus) => {
  switch (status) {
    case "present":
      return "bg-[green] text-primary-foreground shadow-lg";
    case "absent":
      return "bg-[red] text-primary-foreground shadow-lg";
    case "late":
      return "bg-[yellow] text-primary-foreground shadow-lg";
    default:
      return "bg-[lightgrey] text-muted-foreground";
  }
};

const getStatusLetter = (status: AttendanceStatus) => {
  switch (status) {
    case "present":
      return "✓";
    case "absent":
      return "✗";
    case "late":
      return "L";
    default:
      return "—";
  }
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

const calculateStats = (students: Student[]) => {
  let total = 0;
  let present = 0;
  let absent = 0;
  let late = 0;

  students.forEach((student) => {
    student.attendance.forEach((day) => {
      day.lessons.forEach((status) => {
        if (status !== null) {
          total++;
          if (status === "present") present++;
          if (status === "absent") absent++;
          if (status === "late") late++;
        }
      });
    });
  });

  return {
    total,
    present,
    absent,
    late,
    rate: total > 0 ? Math.round((present / total) * 100) : 0,
  };
};

export default function WeeklyAttendancePage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [data, setData] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [week, setWeek] = useState(1);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    axios.get(`${apiUrl}/groups`).then((res) => setGroups(res.data));
  }, [apiUrl]);

  const fetchData = async () => {
    if (!selectedGroup) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${apiUrl}/journal/weekly-attendance/${selectedGroup}?week=${week}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedGroup) fetchData();
  }, [selectedGroup, week]);

  const stats = data ? calculateStats(data.students) : null;

  // Group selection screen
  if (!selectedGroup) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <Card className="w-full max-w-xl shadow-elegant border-0 p-12 text-center animate-scale-in">
            <div className="w-24 h-24 mx-auto mb-8 gradient-primary rounded-2xl shadow-lg flex items-center justify-center">
              <CalendarDays className="w-12 h-12 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-3">
              Ҳузурии Ҳафтагӣ
            </h1>
            <p className="text-muted-foreground mb-8">
              Гурӯҳро интихоб кунед барои дидани ҳузурӣ
            </p>
            <Select onValueChange={setSelectedGroup}>
              <SelectTrigger className="w-full text-lg py-6 border-2 border-border hover:border-primary/50 transition-colors">
                <SelectValue placeholder="Гурӯҳро интихоб кунед..." />
              </SelectTrigger>
              <SelectContent>
                {groups.map((g) => (
                  <SelectItem
                    key={g._id}
                    value={g._id}
                    className="text-base py-3"
                  >
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
      <div className="min-h-screen bg-background">
        <div className="max-w-[1600px] mx-auto p-6 space-y-6">
          {/* Header */}
          <Card className="overflow-hidden border-0 shadow-elegant animate-fade-in">
            <div className="gradient-header p-6 text-primary-foreground">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary-foreground/20 backdrop-blur flex items-center justify-center">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">
                      {data?.groupName || "Гурӯҳ"}
                    </h1>
                    <p className="text-primary-foreground/80">
                      {data?.weekStart} — {data?.weekEnd}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Select
                    value={selectedGroup}
                    onValueChange={setSelectedGroup}
                  >
                    <SelectTrigger className="w-56 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground">
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

                  <div className="flex items-center gap-1 bg-white rounded-full px-2 py-1.5 shadow-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-500 hover:bg-gray-100 h-8 w-8 rounded-full"
                      onClick={() => setWeek((w) => (w <= 1 ? 16 : w - 1))}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex items-center gap-2 px-3">
                      <CalendarDays className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700 min-w-[60px] text-center">
                        Week {data?.weekNumber || week}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-500 hover:bg-gray-100 h-8 w-8 rounded-full"
                      onClick={() => setWeek((w) => (w >= 16 ? 1 : w + 1))}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Stats Cards */}
          {stats && !loading && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
              <Card className="p-5 border-0 shadow-md">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Донишҷӯён</p>
                    <p className="text-2xl font-bold text-foreground">
                      {data?.students.length || 0}
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-5 border-0 shadow-md">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-status-present/20 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-status-present" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ҳузурӣ</p>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.rate}%
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-5 border-0 shadow-md">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-status-absent/20 flex items-center justify-center">
                    <span className="text-xl font-bold text-status-absent">
                      ✗
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ғоибӣ</p>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.absent}
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-5 border-0 shadow-md">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-status-late/20 flex items-center justify-center">
                    <span className="text-xl font-bold text-status-late">
                      L
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Дер омад</p>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.late}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Attendance Table */}
          {loading ? (
            <Card className="p-8 border-0 shadow-elegant animate-pulse-soft">
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <Skeleton className="h-10 flex-1 rounded-lg" />
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card className="overflow-hidden border-0 shadow-elegant animate-fade-in">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-secondary">
                      <th className="p-4 text-left font-semibold text-secondary-foreground sticky left-0 bg-secondary z-20 min-w-[220px] border-r border-border">
                        Донишҷӯ
                      </th>
                      {data?.days.map((day) => (
                        <th
                          key={day.date}
                          colSpan={6}
                          className="px-4 py-3 text-center font-semibold text-secondary-foreground border-l border-border"
                        >
                          <div className="text-sm capitalize">
                            {day.weekday}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {day.date}
                          </div>
                        </th>
                      ))}
                    </tr>
                    <tr className="bg-muted/50">
                      <th className="sticky left-0 bg-muted/50 z-10 border-r border-border"></th>
                      {data?.days.map((day, dayIdx) =>
                        [1, 2, 3, 4, 5, 6].map((lesson) => (
                          <th
                            key={`${dayIdx}-${lesson}`}
                            className="px-2 py-2 text-center text-xs font-medium text-muted-foreground"
                          >
                            {lesson}
                          </th>
                        ))
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {data?.students.map((student, studentIdx) => (
                      <tr
                        key={student._id}
                        className="border-b border-border hover:bg-muted/30 transition-colors"
                        style={{ animationDelay: `${studentIdx * 50}ms` }}
                      >
                        <td className="p-4 sticky left-0 bg-card z-10 border-r border-border">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 ring-2 ring-border">
                              <AvatarFallback className="text-sm font-semibold gradient-primary text-primary-foreground">
                                {getInitials(student.fullName)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-foreground text-sm">
                              {student.fullName}
                            </span>
                          </div>
                        </td>
                        {student.attendance.map((day, dayIdx) =>
                          day.lessons.map((status, lessonIdx) => (
                            <td
                              key={`${dayIdx}-${lessonIdx}`}
                              className="px-1 py-3 text-center"
                            >
                              <div
                                className={`w-8 h-8 mx-auto rounded-lg flex items-center justify-center text-xs font-bold transition-all hover:scale-110 ${getStatusStyle(
                                  status
                                )}`}
                              >
                                {getStatusLetter(status)}
                              </div>
                            </td>
                          ))
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Legend */}
              <div className="p-4 border-t border-border bg-muted/30">
                <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-status-present flex items-center justify-center text-primary-foreground text-xs font-bold">
                      ✓
                    </div>
                    <span className="text-muted-foreground">Ҳозир</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-status-absent flex items-center justify-center text-primary-foreground text-xs font-bold">
                      ✗
                    </div>
                    <span className="text-muted-foreground">Ғоиб</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-status-late flex items-center justify-center text-primary-foreground text-xs font-bold">
                      L
                    </div>
                    <span className="text-muted-foreground">Дер омад</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-status-empty flex items-center justify-center text-muted-foreground text-xs">
                      —
                    </div>
                    <span className="text-muted-foreground">Холӣ</span>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
