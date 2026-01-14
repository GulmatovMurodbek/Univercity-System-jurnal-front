// src/pages/student/StudentDashboard.tsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Calendar,
  ChevronRight,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/shared/StatCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

function getGradeColor(score: number): string {
  if (score >= 86) return 'text-emerald-600';
  if (score >= 71) return 'text-blue-600';
  if (score >= 56) return 'text-amber-600';
  return 'text-rose-600';
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>({});
  const [todayClasses, setTodayClasses] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Semester State
  const currentMonth = new Date().getMonth();
  const defaultSemester = (currentMonth >= 8 || currentMonth <= 0) ? 1 : 2;
  const [semester, setSemester] = useState(defaultSemester);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const [statsRes, classesRes, gradesRes] = await Promise.all([
          axios.get(`${apiUrl}/students/dashboard?semester=${semester}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${apiUrl}/students/today-classes?semester=${semester}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${apiUrl}/students/grades-overview?semester=${semester}`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setStats(statsRes.data);
        setTodayClasses(classesRes.data.classes || []);
        setGrades(gradesRes.data.grades || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl, semester]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 space-y-8">
          <Skeleton className="h-12 w-96" />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-2xl" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <PageHeader
            title={`Салом, ${user?.name?.split(" ")[0] || "Донишҷӯ"}!`}
            description={`${stats.groupName || "Гурӯҳ"} • Курс ${stats.course || "1"}`}
          />

          {/* Semester Switcher (integrated into header area) */}
          <div className="flex bg-white p-1 rounded-lg border shadow-sm">
            <button
              onClick={() => setSemester(1)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-all",
                semester === 1 ? "bg-blue-600 text-white shadow" : "text-muted-foreground hover:bg-slate-50"
              )}
            >
              Семестри 1
            </button>
            <button
              onClick={() => setSemester(2)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-all",
                semester === 2 ? "bg-blue-600 text-white shadow" : "text-muted-foreground hover:bg-slate-50"
              )}
            >
              Семестри 2
            </button>
          </div>
        </div>

        {/* Stats - Original Colorful Components */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Фанҳои ман"
            value={stats.subjectsCount || "0"}
            subtitle="Ин семестр"
            icon={BookOpen}
            color="primary"
          />
          <StatCard
            title="Ҳозиршавӣ"
            value={`${stats.attendanceRate || 0}%`}
            subtitle="Фоизи ҳозирӣ"
            icon={CheckCircle2}
            color="success"
          />
          <StatCard
            title="GPA ҷорӣ"
            value={stats.gpa || "0.00"}
            subtitle="Ҷамъӣ"
            icon={TrendingUp}
            color="info"
          />
          <StatCard
            title="Дарсҳои имрӯз"
            value={todayClasses.length.toString()}
            subtitle="Ба нақша гирифташуда"
            icon={Calendar}
            color="warning"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Баҳоҳо */}
          <motion.div className="lg:col-span-2">
            <Card className="shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-2xl">Баҳоҳои ман</CardTitle>
                <Button variant="ghost" onClick={() => navigate("/student/grades")}>
                  Ҳама дидан
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </CardHeader>
              <CardContent>
                {!grades.length ? (
                  <div className="text-center py-10 text-muted-foreground">
                    Баҳоҳо ҳанӯз нест
                  </div>
                ) : (
                  <div className="space-y-4">
                    {grades.slice(0, 5).map((g: any, i: number) => (
                      <div key={i} className="flex items-center gap-6 p-5 rounded-2xl bg-muted/30 hover:bg-muted/50 transition">
                        <div className="flex-1">
                          <h4 className="text-xl font-bold">{g.subject}</h4>
                          <p className="text-sm text-muted-foreground mt-1">Миёнаи баҳо</p>
                        </div>
                        <div className="text-right">
                          <p className={cn("text-4xl font-bold", getGradeColor(g.average))}>
                            {g.average}
                          </p>
                          <p className="text-sm text-muted-foreground">/5.0</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Ҷадвали имрӯз */}
          <motion.div>
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl">Дарсҳои имрӯз</CardTitle>
              </CardHeader>
              <CardContent>
                {!todayClasses.length ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                    <Calendar className="w-12 h-12 mb-2 opacity-20" />
                    <p>Имрӯз дарс нест</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todayClasses.map((cls: any, i: number) => (
                      <div key={i} className={cn("p-4 rounded-2xl", i === 0 ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white" : "bg-muted/30")}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold">{cls.time}</span>
                          {i === 0 && <Badge className="bg-white/20">Ҳозир</Badge>}
                        </div>
                        <h4 className="font-semibold">{cls.subject}</h4>
                        <p className="text-sm opacity-80 mt-1">{cls.room} • {cls.teacher}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}