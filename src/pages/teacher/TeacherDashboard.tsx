// src/pages/teacher/TeacherDashboard.tsx — ПУРРА, ЗЕБО, БО ДАРСҲОИ ИМРӮЗ АЗ API
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Clock,
  Users,
  ClipboardCheck,
  FileSpreadsheet,
  Calendar,
  ChevronRight,
  User,
  Building2,
  Award,
  CalendarDays,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/shared/StatCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { cn } from "@/lib/utils";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const fullName = user?.name || "Муаллим";

  const [data, setData] = useState({
    groups: [],
    subjects: [],
    totalHours: 0,
    todayLessons: [],
  });
  const [loading, setLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${apiUrl}/weeklySchedule/my-schedule`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setData({
          groups: res.data.groups || [],
          subjects: res.data.subjects || [],
          totalHours: res.data.totalHours || 0,
          todayLessons: res.data.todayLessons || [],
        });
      } catch (err) {
        console.error("Error fetching teacher data:", err);
        setData({
          groups: [],
          subjects: [],
          totalHours: 0,
          todayLessons: [],
        });
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "teacher") {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user, apiUrl]);

  const todayLessonsCount = data.todayLessons.length;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Header */}
          <PageHeader
            title={`Салом, ${user?.fullName}`}
            description="Назар ба ҷадвали дарсии шумо имрӯз"
          />

          {/* Stats */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-3xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <StatCard
                title="Дарсҳои имрӯз"
                value={todayLessonsCount.toString()}
                subtitle="Ба нақша гирифташуда"
                icon={CalendarDays}
                color="primary"
              />
              <StatCard
                title="Соатҳои ҳафтаина"
                value={data.totalHours.toString()}
                subtitle="Соат дар ин ҳафта"
                icon={Clock}
                color="info"
              />
              <StatCard
                title="Гурӯҳҳои ман"
                value={data.groups.length.toString()}
                subtitle="Гурӯҳҳои фаъол"
                icon={Users}
                color="success"
              />
              <StatCard
                title="Фанҳои ман"
                value={data.subjects.length.toString()}
                subtitle="Фанҳои таълимӣ"
                icon={BookOpen}
                color="warning"
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Today's Schedule */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <Card className="shadow-2xl border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
                  <CardTitle className="text-3xl font-bold flex items-center gap-4">
                    <Calendar className="w-10 h-10" />
                    Ҷадвали имрӯз
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-4 text-white hover:bg-white/20"
                    onClick={() => navigate("/teacher/schedule")}
                  >
                    Ҷадвали пурра
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </CardHeader>
                <CardContent className="pt-8">
                  {loading ? (
                    <div className="space-y-6">
                      {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-28 rounded-3xl" />
                      ))}
                    </div>
                  ) : data.todayLessons.length === 0 ? (
                    <div className="text-center py-20">
                      <Calendar className="w-20 h-20 mx-auto mb-6 text-muted-foreground/50" />
                      <h3 className="text-2xl font-bold text-slate-600 dark:text-slate-300">
                        Имрӯз дарс нест
                      </h3>
                      <p className="text-muted-foreground mt-3">
                        Аз фаъолияти дигар истифода баред!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {data.todayLessons.map((lesson: any, idx: number) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -50 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          <Card
                            className={cn(
                              "overflow-hidden transition-all duration-500 hover:shadow-2xl",
                              lesson.isCurrent
                                ? "ring-4 ring-indigo-500 shadow-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                                : "bg-white dark:bg-slate-800"
                            )}
                          >
                            <div className="p-8">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                  <div
                                    className={cn(
                                      "w-20 h-20 rounded-3xl flex flex-col items-center justify-center text-3xl font-bold shadow-xl",
                                      lesson.isCurrent ? "bg-white/30" : "bg-gradient-to-br from-indigo-100 to-purple-100"
                                    )}
                                  >
                                    <span className="text-sm opacity-80">Дарс</span>
                                    {lesson.lessonNumber || idx + 1}
                                  </div>
                                  <div>
                                    <h3 className="text-2xl font-bold mb-2">{lesson.subject}</h3>
                                    <div className="flex flex-wrap items-center gap-4 text-base">
                                      <Badge variant={lesson.isCurrent ? "default" : "secondary"}>
                                        <User className="w-4 h-4 mr-1" />
                                        Гурӯҳ {lesson.group}
                                      </Badge>
                                      <Badge variant={lesson.isCurrent ? "default" : "outline"}>
                                        <Building2 className="w-4 h-4 mr-1" />
                                        Синф {lesson.classroom}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <p className="text-2xl font-bold mb-3">{lesson.time}</p>
                                  {lesson.isCurrent && (
                                    <Badge className="text-lg px-6 py-3 animate-pulse bg-white text-indigo-600">
                                      Ҳозир
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions + Профил */}
            <div className="space-y-8">
              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="shadow-2xl border-0">
                  <CardHeader className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <ClipboardCheck className="w-8 h-8" />
                      Амалиётҳои зуд
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-5">
                    <Button
                      variant="default"
                      size="lg"
                      className="w-full justify-start text-lg py-8 shadow-xl"
                      onClick={() => navigate("/teacher/attendance")}
                    >
                      <ClipboardCheck className="w-8 h-8 mr-5" />
                      <div className="text-left">
                        <p className="font-bold">Ҳузурӣ гирифтан</p>
                        <p className="text-sm opacity-80 mt-1">Барои дарсҳои имрӯз</p>
                      </div>
                    </Button>

                    <Button
                      variant="default"
                      size="lg"
                      className="w-full justify-start text-lg py-8 shadow-xl"
                      onClick={() => navigate("/teacher/grades")}
                    >
                      <FileSpreadsheet className="w-8 h-8 mr-5" />
                      <div className="text-left">
                        <p className="font-bold">Баҳо гузоштан</p>
                        <p className="text-sm opacity-80 mt-1">Навсозии баҳоҳо</p>
                      </div>
                    </Button>

                    <Button
                      variant="default"
                      size="lg"
                      className="w-full justify-start text-lg py-8 shadow-xl"
                      onClick={() => navigate("/teacher/groups")}
                    >
                      <Users className="w-8 h-8 mr-5" />
                      <div className="text-left">
                        <p className="font-bold">Гурӯҳҳои ман</p>
                        <p className="text-sm opacity-80 mt-1">Рӯйхати гурӯҳҳо</p>
                      </div>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Профили муаллим */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="shadow-2xl border-0 bg-gradient-to-br from-indigo-600 to-purple-700 text-white overflow-hidden">
                  <CardContent className="p-8 relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                    <div className="relative z-10">
                      <div className="flex items-center gap-6 mb-8">
                        <Avatar className="w-28 h-28 border-4 border-white/30">
                          <AvatarFallback className="text-5xl font-bold bg-white/20">
                            {fullName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-3xl font-bold">{fullName}</h3>
                          <p className="text-xl opacity-90 mt-2">{user?.faculty || "Факультет"}</p>
                        </div>
                      </div>

                      <div className="space-y-5 text-lg">
                        <div className="flex justify-between items-center bg-white/10 rounded-2xl p-4">
                          <span className="opacity-90">Фанҳо</span>
                          <span className="font-bold text-xl">
                            {data.subjects.length > 0 ? data.subjects.join(", ") : "—"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center bg-white/10 rounded-2xl p-4">
                          <span className="opacity-90">Соат дар ҳафта</span>
                          <span className="font-bold text-3xl">{data.totalHours}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white/10 rounded-2xl p-4">
                          <span className="opacity-90">Гурӯҳҳо</span>
                          <span className="font-bold text-xl">{data.groups.length}</span>
                        </div>
                      </div>

                      <Button
                        variant="secondary"
                        size="lg"
                        className="w-full mt-8 bg-white/20 hover:bg-white/30 text-white border-white/30 text-xl py-7"
                        onClick={() => navigate("/teacher/profile")}
                      >
                        <Award className="w-7 h-7 mr-3" />
                        Дидани профил
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}