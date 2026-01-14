// src/pages/student/MyAttendancePage.tsx
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

export default function MyAttendancePage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openWeeks, setOpenWeeks] = useState<number[]>([]);

  // Semester State (default to current based on month, similar to MyGrades)
  const currentMonth = new Date().getMonth();
  const defaultSemester = (currentMonth >= 8 || currentMonth <= 0) ? 1 : 2;
  const [semester, setSemester] = useState(defaultSemester);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (user?.role !== "student") return;
    setLoading(true);
    axios
      .get(`${apiUrl}/journal/my-attendance?semester=${semester}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => {
        setData(res.data);
        // Open current week automatically if available
        if (res.data?.weeks) {
          // Logic to open today's week? Or just all?
          // Let's open the first active week or just first 1-2.
          // For now, let's keep all closed or open specific ones.
          // User logic previously opened all. Let's open the "current" week based on date.
          // Or just keep it clean (all closed or just current week).
          const today = new Date();
          // Simpler: Just open the last week that has data? Or active week.
          // Let's just open the current week if found.
          // (Simplification: collapse all by default for "minimalism" or open the latest?)
          // Let's open nothing by default to keep it clean, or maybe the current week.
        }
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [user, semester]);

  // Toggle Week
  const toggleWeek = (weekNum: number) => {
    setOpenWeeks(prev =>
      prev.includes(weekNum) ? prev.filter(w => w !== weekNum) : [...prev, weekNum]
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Safe checks
  const weeks = data?.weeks || [];
  const stats = data?.stats || { rate: 0, present: 0, absent: 0, total: 0 };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-border/40">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Clock className="w-6 h-6 text-blue-600" />
              Ҳозиршавии ман
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Семестри {semester} • Пешрафти давомот
            </p>
          </div>

          {/* Semester Selector */}
          <div className="flex items-center bg-muted/50 p-1 rounded-lg border">
            <button
              onClick={() => setSemester(1)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-all duration-200",
                semester === 1
                  ? "bg-white text-blue-600 shadow-sm border border-border/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/50"
              )}
            >
              Семестри 1
            </button>
            <button
              onClick={() => setSemester(2)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-all duration-200",
                semester === 2
                  ? "bg-white text-blue-600 shadow-sm border border-border/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/50"
              )}
            >
              Семестри 2
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <span className="text-xl font-bold">%</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.rate}%</div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Давомот</p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.present}</div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Ҳозир</p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
                <XCircle className="w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.absent}</div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Ғоиб</p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mb-3">
                <Clock className="w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Ҷамъи дарсҳо</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="border-0 shadow-none bg-transparent">
          <div className="flex justify-between text-sm mb-2 px-1">
            <span className="font-medium text-muted-foreground">Пешрафти умумӣ</span>
            <span className={cn("font-bold", stats.rate >= 90 ? "text-emerald-600" : stats.rate >= 70 ? "text-blue-600" : "text-rose-600")}>{stats.rate}%</span>
          </div>
          <Progress value={stats.rate} className="h-3 bg-muted" indicatorClassName={cn(stats.rate >= 90 ? "bg-emerald-500" : stats.rate >= 70 ? "bg-blue-600" : "bg-rose-500")} />
        </Card>

        {/* Weeks Accordion / List */}
        {!weeks.length ? (
          <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
            <p className="text-muted-foreground">Маълумот барои ин семестр дастрас нест</p>
          </div>
        ) : (
          <div className="space-y-3">
            {weeks.map((week: any) => {
              const isOpen = openWeeks.includes(week.weekNumber);
              // Check if week needs attention (e.g. has absence)
              const hasAbsence = week.days.some((d: any) => d.lessons.includes("N"));

              return (
                <div key={week.weekNumber} className="border rounded-xl bg-white shadow-sm overflow-hidden transition-all duration-200">
                  <div
                    onClick={() => toggleWeek(week.weekNumber)}
                    className={cn(
                      "p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors select-none",
                      isOpen && "bg-slate-50"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm",
                        isOpen ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "bg-slate-100 text-slate-500"
                      )}>
                        W{week.weekNumber}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Ҳафтаи {week.weekNumber}</h4>
                        <p className="text-xs text-muted-foreground">{week.weekStart} — {week.weekEnd}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {hasAbsence && !isOpen && (
                        <div className="flex items-center gap-1 text-xs font-medium text-rose-500 bg-rose-50 px-2 py-1 rounded-md">
                          <XCircle className="w-3 h-3" /> Ғоиб
                        </div>
                      )}
                      {isOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isOpen && (
                    <div className="p-4 pt-0 border-t border-slate-100 bg-slate-50/30">
                      <div className="overflow-x-auto pb-2">
                        <table className="w-full text-sm min-w-[600px]">
                          <thead>
                            <tr>
                              <th className="p-3 text-left font-medium text-muted-foreground w-32">Рӯз</th>
                              {[1, 2, 3, 4, 5, 6].map(i => (
                                <th key={i} className="p-3 text-center font-medium text-muted-foreground w-12 text-xs">#{i}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {week.days.map((day: any) => (
                              <tr key={day.date} className="border-b last:border-0 border-slate-100 hover:bg-white transition-colors">
                                <td className="p-3 font-medium text-gray-700">
                                  <div className="flex flex-col">
                                    <span>{day.weekday}</span>
                                    <span className="text-[10px] text-muted-foreground">{day.date}</span>
                                  </div>
                                </td>
                                {day.lessons.map((status: string, idx: number) => {
                                  let badgeClass = "bg-slate-100 text-slate-400"; // Empty/Dash
                                  let content = "—";

                                  if (status === "H") {
                                    badgeClass = "bg-emerald-100 text-emerald-700 font-bold border border-emerald-200";
                                    content = "Ҳ";
                                  } else if (status === "N") {
                                    badgeClass = "bg-rose-100 text-rose-600 font-bold border border-rose-200";
                                    content = "Ғ";
                                  } else if (status === "L") {
                                    badgeClass = "bg-amber-100 text-amber-600 font-bold border border-amber-200";
                                    content = "Д";
                                  }

                                  return (
                                    <td key={idx} className="p-2 text-center">
                                      <div className={cn("w-8 h-8 mx-auto rounded-md flex items-center justify-center text-xs transition-transform hover:scale-105 select-none cursor-default", badgeClass)}>
                                        {content}
                                      </div>
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}