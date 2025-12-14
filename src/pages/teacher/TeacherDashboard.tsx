// src/pages/teacher/TeacherDashboard.tsx — ПУРРА, ЗЕБО, БЕ ХАТОГӢ ВА КОРКУНАНДА
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
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/shared/StatCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { cn } from "@/lib/utils";
export interface User {
  id: string;
  fullName: string;
  role: string;
}
export default function TeacherDashboard() {
  const { user} = useAuth()
  const fullName = user?.name
  const navigate = useNavigate();

  const [teachingData, setTeachingData] = useState({
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

        setTeachingData({
          groups: res.data.groups || [],
          subjects: res.data.subjects || [],
          totalHours: res.data.totalHours || 0,
          todayLessons: res.data.todayLessons || [], // агар бекенд имрӯзро баргардонад
        });
      } catch (err) {
        console.error("Error fetching teacher data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl]);

  return (
    <DashboardLayout>
      <PageHeader
        title={`Салом, ${fullName?.split(" ")[0] || "Муаллим"}!`}
        description="Назар ба ҷадвали дарсии шумо имрӯз"
      />

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Дарсҳои имрӯз"
            value={teachingData.todayLessons.length || "0"}
            subtitle="Дарсҳои ба нақша гирифташуда"
            icon={Calendar}
            color="primary"
            delay={0}
          />
          <StatCard
            title="Соатҳои ҳафтаина"
            value={teachingData.totalHours.toString()}
            subtitle="Соат дар ин ҳафта"
            icon={Clock}
            color="info"
            delay={0.1}
          />
          <StatCard
            title="Гурӯҳҳои ман"
            value={teachingData.groups.length.toString()}
            subtitle="Гурӯҳҳои фаъол"
            icon={Users}
            color="success"
            delay={0.2}
          />
          <StatCard
            title="Фанҳои ман"
            value={teachingData.subjects.length.toString()}
            subtitle="Фанҳои таълимӣ"
            icon={BookOpen}
            color="warning"
            delay={0.3}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl">Ҷадвали имрӯз</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/teacher/schedule")}>
                Ҷадвали пурра
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-2xl" />
                  ))}
                </div>
              ) : teachingData.todayLessons.length === 0 ? (
                <div className="text-center py-16">
                  <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg text-muted-foreground">Имрӯз дарс нест</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {teachingData.todayLessons.map((lesson: any, idx: number) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex items-center gap-6 p-6 rounded-2xl transition-all shadow-md",
                        lesson.isCurrent
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-2xl"
                          : "bg-card hover:bg-muted/50"
                      )}
                    >
                      <div
                        className={cn(
                          "w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-bold",
                          lesson.isCurrent ? "bg-white/20" : "bg-muted"
                        )}
                      >
                        <span className="text-xs">Дарс</span>
                        <span className="text-2xl">{lesson.lessonNumber}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold">{lesson.subject}</h4>
                        <p className={cn("text-sm mt-1", lesson.isCurrent ? "text-white/80" : "text-muted-foreground")}>
                          Гурӯҳ {lesson.group} • Синф {lesson.classroom}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-medium">{lesson.time}</p>
                        {lesson.isCurrent && (
                          <Badge className="mt-2 animate-pulse bg-white text-indigo-600">
                            Ҳозир
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl">Амалиётҳои зуд</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="default"
                size="lg"
                className="w-full justify-start shadow-md"
                onClick={() => navigate("/teacher/attendance")}
              >
                <ClipboardCheck className="w-6 h-6 mr-4" />
                <div className="text-left">
                  <p className="font-semibold text-lg">Ҳузурӣ гирифтан</p>
                  <p className="text-sm opacity-80">Барои дарсҳои имрӯз</p>
                </div>
              </Button>

              <Button
                variant="default"
                size="lg"
                className="w-full justify-start shadow-md"
                onClick={() => navigate("/teacher/grades")}
              >
                <FileSpreadsheet className="w-6 h-6 mr-4" />
                <div className="text-left">
                  <p className="font-semibold text-lg">Баҳо гузоштан</p>
                  <p className="text-sm opacity-80">Навсозии баҳоҳои донишҷӯён</p>
                </div>
              </Button>

              <Button
                variant="default"
                size="lg"
                className="w-full justify-start shadow-md"
                onClick={() => navigate("/teacher/groups")}
              >
                <Users className="w-6 h-6 mr-4" />
                <div className="text-left">
                  <p className="font-semibold text-lg">Гурӯҳҳои ман</p>
                  <p className="text-sm opacity-80">Дидани гурӯҳҳои таълимӣ</p>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Профили муаллим */}
          <Card className="mt-6 shadow-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
            <CardContent className="p-8">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 rounded-3xl bg-white/20 flex items-center justify-center text-4xl font-bold">
                  {fullName?.charAt(0) || "М"}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{fullName|| "Муаллим"}</h3>
                  <p className="text-lg opacity-90">{user?.faculty || "Факультет"}</p>
                </div>
              </div>
              <div className="space-y-3 text-lg">
                <div className="flex justify-between">
                  <span className="opacity-90">Фанҳо</span>
                  <span className="font-medium">
                    {teachingData.subjects.join(", ") || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-90">Соат дар ҳафта</span>
                  <span className="font-medium">{teachingData.totalHours}</span>
                </div>
              </div>
              <Button
                variant="secondary"
                size="lg"
                className="w-full mt-8 bg-white/20 hover:bg-white/30 text-white border-white/30"
                onClick={() => navigate("/teacher/profile")}
              >
                Дидани профил
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}