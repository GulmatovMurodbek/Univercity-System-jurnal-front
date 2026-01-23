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
  Bell,
  Search,
  LogOut,
  Settings
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { cn } from "@/lib/utils";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const fullName = user?.fullName || user?.name || "Муаллим";
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
        // Fallback or empty data
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

  // New Date Formatting
  const todayDate = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
  const formattedDate = todayDate.toLocaleDateString('tg-TJ', dateOptions); // Tajik locale if supported, else default

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#F3F4F6] dark:bg-slate-900 p-6 font-sans">

        {/* Top Navigation Bar */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Салом, {fullName} 👋</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 capitalize">{formattedDate}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-white dark:bg-slate-800 p-2 rounded-full shadow-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition">
              <Search className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </div>
            <div className="bg-white dark:bg-slate-800 p-2 rounded-full shadow-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition relative">
              <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </div>
            <Avatar className="w-10 h-10 border-2 border-white shadow-md cursor-pointer" onClick={() => navigate('/teacher/profile')}>
              <AvatarFallback className="bg-indigo-600 text-white font-bold">{fullName.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column (Stats & Schedule) */}
          <div className="lg:col-span-8 space-y-8">

            {/* Valid Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Daily Lessons */}
              <Card className="border-none shadow-sm bg-white dark:bg-slate-800 hover:shadow-md transition-all cursor-default">
                <CardContent className="p-5 flex flex-col items-center justify-center text-center h-full">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-3 text-indigo-600 dark:text-indigo-400">
                    <CalendarDays className="w-6 h-6" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{todayLessonsCount}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Дарсҳои имрӯз</p>
                </CardContent>
              </Card>

              {/* Weekly Hours */}
              <Card className="border-none shadow-sm bg-white dark:bg-slate-800 hover:shadow-md transition-all cursor-default">
                <CardContent className="p-5 flex flex-col items-center justify-center text-center h-full">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-3 text-blue-600 dark:text-blue-400">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{data.totalHours}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Соатҳои ҳафтаина</p>
                </CardContent>
              </Card>

              {/* Active Groups */}
              <Card className="border-none shadow-sm bg-white dark:bg-slate-800 hover:shadow-md transition-all cursor-default">
                <CardContent className="p-5 flex flex-col items-center justify-center text-center h-full">
                  <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-3 text-emerald-600 dark:text-emerald-400">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{data.groups.length}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Гурӯҳҳои фаъол</p>
                </CardContent>
              </Card>

              {/* Subjects */}
              <Card className="border-none shadow-sm bg-white dark:bg-slate-800 hover:shadow-md transition-all cursor-default">
                <CardContent className="p-5 flex flex-col items-center justify-center text-center h-full">
                  <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mb-3 text-amber-600 dark:text-amber-400">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{data.subjects.length}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Фанҳои таълимӣ</p>
                </CardContent>
              </Card>
            </div>

            {/* Today's Schedule Section */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  Ҷадвали имрӯз
                </h2>
                <Button variant="ghost" className="text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700" onClick={() => navigate("/teacher/schedule")}>
                  Ҷадвали пурра <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              <div className="space-y-4">
                {loading ? (
                  [1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
                ) : data.todayLessons.length === 0 ? (
                  <div className="bg-white dark:bg-slate-800 rounded-3xl p-10 text-center shadow-sm">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                      <Calendar className="w-10 h-10" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Имрӯз дарс нест</h3>
                    <p className="text-slate-500 text-sm mt-2">Рӯзи хуб дошта бошед!</p>
                  </div>
                ) : (
                  data.todayLessons.map((lesson: any, idx: number) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group"
                    >
                      <div className={cn(
                        "bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-transparent hover:border-indigo-100 hover:shadow-md transition-all flex items-center gap-5",
                        lesson.isCurrent && "border-indigo-500 ring-2 ring-indigo-500/20"
                      )}>
                        {/* Time Slot */}
                        <div className={cn(
                          "flex-shrink-0 w-[80px] text-center rounded-xl py-3 px-1",
                          lesson.isCurrent ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                        )}>
                          <span className="block text-xs uppercase opacity-70 mb-1">Дарс</span>
                          <span className="block text-2xl font-bold leading-none">{lesson.lessonNumber}</span>
                        </div>

                        {/* Details */}
                        <div className="flex-grow min-w-0">
                          <div className="flex justify-between items-start">
                            <h4 className="text-lg font-bold text-slate-800 dark:text-white truncate pr-2 group-hover:text-indigo-600 transition-colors">
                              {lesson.subject}
                            </h4>
                            <Badge variant="outline" className="bg-slate-50 whitespace-nowrap">
                              {lesson.time}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-sm text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-700/50 px-2 py-1 rounded-md">
                              <Users className="w-3 h-3" /> {lesson.group}
                            </span>
                            <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-700/50 px-2 py-1 rounded-md">
                              <Building2 className="w-3 h-3" /> Синфи {lesson.classroom}
                            </span>
                          </div>
                        </div>

                        {/* Action */}
                        <div className="hidden sm:block">
                          <Button size="icon" variant="ghost" className="rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
                            <ChevronRight className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Right Column (Profile & Quick Actions) */}
          <div className="lg:col-span-4 space-y-8">

            {/* New Profile Card Design */}
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white shadow-xl p-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl -ml-10 -mb-10"></div>

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full border-4 border-white/30 p-1 mb-4">
                  <Avatar className="w-full h-full">
                    <AvatarFallback className="bg-white text-indigo-600 text-3xl font-bold">{fullName.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
                <h2 className="text-2xl font-bold">{fullName}</h2>
                <p className="text-indigo-100 text-sm mt-1 mb-6">{user?.faculty || "Факултети Номуайян"}</p>

                <div className="w-full bg-white/10 rounded-2xl p-4 backdrop-blur-sm mb-6">
                  <p className="text-xs text-indigo-200 uppercase tracking-widest mb-2 font-semibold">Маълумот</p>
                  <div className="text-sm space-y-2 text-left">
                    <div className="flex justify-between">
                      <span className="opacity-80">Кафедра:</span>
                      <span className="font-semibold">{(user as any)?.department || "Иттилоот"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-80">Статус:</span>
                      <span className="font-semibold flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div> Фаъол
                      </span>
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-white text-indigo-600 hover:bg-indigo-50 font-bold h-12 rounded-xl transition shadow-lg" onClick={() => navigate("/teacher/profile")}>
                  <User className="w-4 h-4 mr-2" /> Дидани Профил
                </Button>
              </div>
            </div>

            {/* Quick Actions List */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 ml-1">Амалиётҳои зуд</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/teacher/attendance")}
                  className="w-full bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm hover:shadow-md transition flex items-center gap-4 group"
                >
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <ClipboardCheck className="w-6 h-6" />
                  </div>
                  <div className="text-left flex-1">
                    <h4 className="font-bold text-slate-800 dark:text-white">Ҳузурӣ гирифтан</h4>
                    <p className="text-xs text-slate-500">Барои дарсҳои имрӯз</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                </button>

                <button
                 
                  className="w-full bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm hover:shadow-md transition flex items-center gap-4 group"
                >
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div className="text-left flex-1">
                    <h4 className="font-bold text-slate-800 dark:text-white">Баҳо гузоштан</h4>
                    <p className="text-xs text-slate-500">Навсозии баҳоҳо</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </button>

                <button
                  onClick={() => navigate("/teacher/groups")}
                  className="w-full bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm hover:shadow-md transition flex items-center gap-4 group"
                >
                  <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="text-left flex-1">
                    <h4 className="font-bold text-slate-800 dark:text-white">Гурӯҳҳои ман</h4>
                    <p className="text-xs text-slate-500">Рӯйхати гурӯҳҳо</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-purple-500 transition-colors" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}