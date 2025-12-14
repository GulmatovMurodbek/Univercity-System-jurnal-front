// src/pages/student/MyAttendancePage.tsx
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

export default function MyAttendancePage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (user?.role !== "student") return;

    setLoading(true);
    axios
      .get(`${apiUrl}/journal/my-attendance`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 space-y-8">
          <Skeleton className="h-12 w-96" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-2xl" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!data || data.weeks.length === 0) {
    return (
      <DashboardLayout>
        <div className="p-20 text-center">
          <Clock className="w-24 h-24 mx-auto mb-8 text-muted-foreground/30" />
          <h2 className="text-3xl font-bold mb-4">Ҳанӯз маълумот нест</h2>
          <p className="text-lg text-muted-foreground">
            Дарсҳо ҳанӯз оғоз нашудаанд ё ҳозиршавӣ сабт нашудааст
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const { weeks, stats } = data;

  return (
    <DashboardLayout>
      <PageHeader title="Ҳозиршавии ман" description="Аз 1 сентябр то имрӯз" />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <Card className="p-8 text-center shadow-2xl">
          <div className="text-5xl font-bold text-primary mb-3">{stats.rate}%</div>
          <p className="text-muted-foreground">Фоизи ҳозиршавӣ</p>
        </Card>
        <Card className="p-8 text-center shadow-2xl">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-emerald-500" />
          <div className="text-4xl font-bold">{stats.present}</div>
          <p className="text-muted-foreground">Ҳозир</p>
        </Card>
        <Card className="p-8 text-center shadow-2xl">
          <XCircle className="w-16 h-16 mx-auto mb-4 text-rose-500" />
          <div className="text-4xl font-bold">{stats.absent}</div>
          <p className="text-muted-foreground">Нест</p>
        </Card>
        <Card className="p-8 text-center shadow-2xl">
          <div className="text-4xl font-bold">{stats.total}</div>
          <p className="text-muted-foreground mt-4">Ҷамъи дарсҳо</p>
        </Card>
      </div>

      {/* Progress */}
      <Card className="shadow-2xl mb-10">
        <CardContent className="p-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold">Пешрафт</h3>
            <span className="text-4xl font-bold text-primary">{stats.rate}%</span>
          </div>
          <Progress value={stats.rate} className="h-8" />
        </CardContent>
      </Card>

      {/* Ҳафтаҳо */}
      <div className="space-y-8">
        {weeks.map((week: any) => (
          <Card key={week.weekNumber} className="shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
              <h3 className="text-2xl font-bold">
                Ҳафтаи {week.weekNumber} ({week.weekStart} — {week.weekEnd})
              </h3>
            </div>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-4 text-left font-bold sticky left-0 bg-gray-100">Рӯз</th>
                      <th className="p-4 text-center">L1</th>
                      <th className="p-4 text-center">L2</th>
                      <th className="p-4 text-center">L3</th>
                      <th className="p-4 text-center">L4</th>
                      <th className="p-4 text-center">L5</th>
                      <th className="p-4 text-center">L6</th>
                    </tr>
                  </thead>
                  <tbody>
                    {week.days.map((day: any) => (
                      <tr key={day.date} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-medium sticky left-0 bg-white">
                          {day.weekday} <span className="text-muted-foreground">({day.date})</span>
                        </td>
                        {day.lessons.map((status: string, i: number) => (
                          <td key={i} className="p-4 text-center">
                            <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg ${
                              status === "H" ? "bg-emerald-500 text-white" :
                              status === "N" ? "bg-rose-500 text-white" :
                              status === "L" ? "bg-amber-500 text-white" :
                              "bg-gray-200 text-gray-500"
                            }`}>
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
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}