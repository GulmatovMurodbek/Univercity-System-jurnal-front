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
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (user?.role !== "student") return;
    setLoading(true);
    axios
      .get(`${apiUrl}/journal/my-attendance`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [user]);

  // Ҳамаи ҳафтаҳоро дар аввал кушода кунед, агар хоҳед
  useEffect(() => {
    if (data?.weeks?.length > 0) {
      setOpenWeeks(data.weeks.map((w: any) => w.weekNumber));
    }
  }, [data]);

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
          <Clock className="w-20 h-20 mx-auto text-muted-foreground/40" />
          <h2 className="text-3xl font-bold">Ҳанӯз маълумот нест</h2>
          <p className="text-lg text-muted-foreground">
            Дарсҳо ҳанӯз оғоз нашудаанд ё ҳозиршавӣ сабт нашудааст
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const { weeks, stats } = data;

  // Ранг барои ҳолатҳо
  const getStatusColor = (status: string) => {
    switch (status) {
      case "H": return "bg-emerald-500 text-white"; // Ҳозир
      case "N": return "bg-rose-500 text-white";    // Нест
      case "L": return "bg-amber-500 text-white";   // Дер
      default:  return "bg-gray-200 text-gray-500";
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Ҳозиршавии ман"
        description="Аз 1 сентябр то имрӯз — пешрафти шумо"
      />

      {/* Stats — зебо ва компакт */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="text-5xl font-bold">{stats.rate}%</div>
            <p className="text-sm mt-2 opacity-90">Фоизи ҳозиршавӣ</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardContent className="p-6 text-center">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
            <div className="text-4xl font-bold">{stats.present}</div>
            <p className="text-sm text-muted-foreground mt-1">Ҳозир</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardContent className="p-6 text-center">
            <XCircle className="w-10 h-10 mx-auto mb-2 text-rose-500" />
            <div className="text-4xl font-bold">{stats.absent}</div>
            <p className="text-sm text-muted-foreground mt-1">Нест</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground mt-2">Ҷамъи дарсҳо</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress bar */}
      <Card className="mb-10 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-center">
            <span>Пешрафт</span>
            <span className="text-2xl font-bold text-primary">{stats.rate}%</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress
            value={stats.rate}
            className="h-4 bg-gray-200 rounded-full [&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-green-600"
          />
        </CardContent>
      </Card>

      {/* Ҳафтаҳо — collapsible */}
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
                            {day.lessons.map((status: string, i: number) => (
                              <td key={i} className="p-2 text-center">
                                <div
                                  className={cn(
                                    "w-10 h-10 mx-auto rounded-xl flex items-center justify-center text-lg font-bold shadow-md transition-transform hover:scale-105",
                                    getStatusColor(status)
                                  )}
                                >
                                  {status}
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