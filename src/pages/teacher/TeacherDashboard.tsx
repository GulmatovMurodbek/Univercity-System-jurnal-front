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
  Calendar as CalendarIcon,
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
import { format } from "date-fns";
import { ru } from "date-fns/locale";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
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
  const [date, setDate] = useState<Date | undefined>(new Date());

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const dateStr = date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');

        const res = await axios.get(`${apiUrl}/weeklySchedule/my-schedule?date=${dateStr}`, {
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
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "teacher") {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user, apiUrl, date]);

  const todayLessonsCount = data.todayLessons.length;

  // Date Formatting
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
  const formattedDate = date ? date.toLocaleDateString('tg-TJ', dateOptions) : 'Имрӯз';

  // Helper for Calendar Widget to avoid duplication
  const CalendarWidget = (
    <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-sm mb-8 lg:mb-0">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Тақвим</h3>
        <Button variant="ghost" size="sm" onClick={() => setDate(new Date())} className="text-xs text-indigo-600">
          Имрӯз
        </Button>
      </div>
      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          locale={ru}
          className="rounded-xl border shadow-none w-full"
          disabled={(date) => {
            // Logic: Disable if date is NOT in current week (Mon-Sun)
            const now = new Date();
            const currentDay = now.getDay(); // 0=Sun, 1=Mon ...

            // Find Monday of this week
            // If Sunday (0), go back 6 days. Else go back (day-1) days.
            const diffToMon = currentDay === 0 ? 6 : currentDay - 1;

            const monday = new Date(now);
            monday.setDate(now.getDate() - diffToMon);
            monday.setHours(0, 0, 0, 0);

            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            sunday.setHours(23, 59, 59, 999);

            // Allow selection only between Monday and Sunday
            return date < monday || date > sunday;
          }}
        />
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#F3F4F6] dark:bg-slate-900 p-6 font-sans">

        {/* Top Navigation Bar */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">Салом, {fullName} 👋</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 capitalize">
              {formattedDate} {date && date.toDateString() === new Date().toDateString() && <span className="text-indigo-500 font-medium ml-2">(Имрӯз)</span>}
            </p>
          </div>

          <div className="flex items-center gap-3 md:gap-4 self-end md:self-auto">
            {/* ... existing header icons ... */}
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {/* ... Stats Cards (keep existing) ... */}
              {/* Daily Lessons */}
              <Card className="border-none shadow-sm bg-white dark:bg-slate-800 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-default">
                <CardContent className="p-4 md:p-5 flex flex-col items-center justify-center text-center h-full">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-3 text-indigo-600 dark:text-indigo-400">
                    <CalendarDays className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">{todayLessonsCount}</h3>
                  <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">Дарсҳо ({date ? format(date, 'dd.MM') : 'Имрӯз'})</p>
                </CardContent>
              </Card>

              {/* Weekly Hours */}
              <Card className="border-none shadow-sm bg-white dark:bg-slate-800 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-default">
                <CardContent className="p-4 md:p-5 flex flex-col items-center justify-center text-center h-full">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-3 text-blue-600 dark:text-blue-400">
                    <Clock className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">{data.totalHours}</h3>
                  <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">Соатҳои ҳафтаина</p>
                </CardContent>
              </Card>

              {/* Active Groups */}
              <Card className="border-none shadow-sm bg-white dark:bg-slate-800 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-default">
                <CardContent className="p-4 md:p-5 flex flex-col items-center justify-center text-center h-full">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-3 text-emerald-600 dark:text-emerald-400">
                    <Users className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">{data.groups.length}</h3>
                  <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">Гурӯҳҳои фаъол</p>
                </CardContent>
              </Card>

              {/* Subjects */}
              <Card className="border-none shadow-sm bg-white dark:bg-slate-800 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-default">
                <CardContent className="p-4 md:p-5 flex flex-col items-center justify-center text-center h-full">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-50 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mb-3 text-amber-600 dark:text-amber-400">
                    <BookOpen className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">{data.subjects.length}</h3>
                  <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">Фанҳои таълимӣ</p>
                </CardContent>
              </Card>
            </div>



            {/* Mobile Calendar: Show ONLY on small screens (lg:hidden) */}
            <div className="block lg:hidden">
              {CalendarWidget}
            </div>

            {/* Today's Schedule Section */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-indigo-600" />
                  Ҷадвали {date ? format(date, 'd MMMM', { locale: ru }) : 'Имрӯз'}
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
                      <CalendarIcon className="w-10 h-10" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Дарс нест</h3>
                    <p className="text-slate-500 text-sm mt-2">Барои санаи интихобшуда дарс ёфт нашуд.</p>
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
                      <div
                        onClick={() => {
                          const dateStr = date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
                          navigate(`/teacher/journal/${dateStr}/${lesson.shift}/${lesson.lessonNumber}/${lesson.groupId}/${lesson.subjectId}`);
                        }}
                        className={cn(
                          "bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border transition-all flex items-center gap-3 md:gap-5 cursor-pointer hover:shadow-md relative overflow-hidden active:scale-[0.99] touch-manipulation",
                          lesson.isHeld
                            ? "border-green-500 bg-green-50/50 dark:bg-green-900/10 hover:border-green-600"
                            : "border-red-300 hover:border-red-500 bg-red-50/10 dark:bg-red-900/10",
                          lesson.isCurrent && "ring-2 ring-indigo-500/20"
                        )}>
                        {/* ... Content stays mostly same ... */}
                        <div className={cn(
                          "absolute left-0 top-0 bottom-0 w-1",
                          lesson.isHeld ? "bg-green-500" : "bg-red-400"
                        )} />

                        <div className={cn(
                          "flex-shrink-0 w-[60px] md:w-[80px] text-center rounded-xl py-2 md:py-3 px-1 ml-2",
                          lesson.isHeld ? "bg-green-100/50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                        )}>
                          <span className="block text-[10px] md:text-xs uppercase opacity-70 mb-1">Дарс</span>
                          <span className="block text-xl md:text-2xl font-bold leading-none">{lesson.lessonNumber}</span>
                        </div>

                        <div className="flex-grow min-w-0">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-1 md:gap-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-base md:text-lg font-bold text-slate-800 dark:text-white truncate pr-2 group-hover:text-indigo-600 transition-colors">
                                {lesson.subject}
                              </h4>
                              <Badge variant="outline" className={cn(
                                "text-[10px] md:text-xs px-2 py-0.5 border-0 font-medium",
                                lesson.lessonType === 'lecture' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" :
                                  lesson.lessonType === 'practice' ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" :
                                    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                              )}>
                                {lesson.lessonType === 'lecture' ? 'Лексия' :
                                  lesson.lessonType === 'practice' ? 'Амалӣ' : 'Лабораторӣ'}
                              </Badge>
                            </div>
                            <Badge variant="outline" className="bg-slate-50 w-fit whitespace-nowrap text-xs md:text-sm">
                              {lesson.time}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1 md:mt-2 text-xs md:text-sm text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-700/50 px-2 py-1 rounded-md">
                              <Users className="w-3 h-3" /> {lesson.group}
                            </span>
                            <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-700/50 px-2 py-1 rounded-md">
                              <Building2 className="w-3 h-3" /> Синфи {lesson.classroom}
                            </span>
                            <span className={cn(
                              "flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                              lesson.isHeld ? "text-green-600 bg-green-100 dark:bg-green-900/30" : "text-red-500 bg-red-100 dark:bg-red-900/30"
                            )}>
                              {lesson.isHeld ? "Пур шудааст" : "Пур нашудааст"}
                            </span>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Right Column (Profile & Calendar) */}
          <div className="lg:col-span-4 space-y-8">
            {/* Profile Card */}
            {/* ... Profile Card code ... */}

            {/* CALENDAR WIDGET: Show ONLY on large screens (hidden lg:block) */}
            <div className="hidden lg:block">
              {CalendarWidget}
            </div>

            {/* Quick Actions (Keep generic or remove if too cluttered) */}
            {/* ... Quick Actions ... */}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
