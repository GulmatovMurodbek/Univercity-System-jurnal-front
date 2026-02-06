// src/pages/admin/AdminDashboard.tsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  GraduationCap,
  BookOpen,
  Building2,
  UserPlus,
  FolderPlus,
  PlusCircle,
  CalendarDays,
  Lock,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/shared/StatCard";
import { Calendar as CalendarComponent } from "@/components/ui/calendar"; // Import UI Calendar
import { PageHeader } from "@/components/shared/PageHeader";
import { AttendanceChart } from "@/components/charts/AttendanceChart";
import { GradeDistributionChart } from "@/components/charts/GradeDistributionChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { format, startOfWeek, endOfWeek, isWithinInterval } from "date-fns"; // Updated imports

import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Clock, Calendar, ChevronRight } from "lucide-react"; // Additional icons

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalGroups: 0,
    attendanceRate: 0,
    avgGrade: 0,
  });

  const [topGroups, setTopGroups] = useState<any[]>([]);
  const [highAbsence, setHighAbsence] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScheduleLoading, setIsScheduleLoading] = useState(false); // New loading state for schedule

  // Dean Specific State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Current Week Logic
  const today = new Date();
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  const currentWeekEnd = endOfWeek(today, { weekStartsOn: 1 });   // Sunday

  const isDateInCurrentWeek = (date: Date) => {
    return isWithinInterval(date, { start: currentWeekStart, end: currentWeekEnd });
  };

  const [teacherData, setTeacherData] = useState({
    groups: [],
    subjects: [],
    totalHours: 0,
    lessons: [], // Renamed from todayLessons to generic lessons
  });

  const apiUrl = import.meta.env.VITE_API_URL;

  // 1. Fetch Admin General Analytics (Once)
  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch Admin Analytics
        const res = await axios.get(`${apiUrl}/analytics/dashboard`, { headers });

        setStats({
          totalStudents: res.data.totalStudents || 0,
          totalGroups: res.data.totalGroups || 0,
          attendanceRate: res.data.attendanceRate || 0,
          avgGrade: res.data.avgGrade || 0,
        });

        setTopGroups(res.data.topGroups || []);
        setHighAbsence(res.data.highAbsenceStudents || []);
      } catch (err) {
        console.error("Хатои Dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, [user]);

  // 2. Fetch Teacher Schedule (On Date Change)
  useEffect(() => {
    const fetchSchedule = async () => {
      if (!user?.role || user.role !== 'teacher' || !user.isDean) return;

      setIsScheduleLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const dateStr = format(selectedDate, "yyyy-MM-dd");

        const teacherRes = await axios.get(`${apiUrl}/weeklySchedule/my-schedule`, {
          headers,
          params: { date: dateStr }
        });

        setTeacherData({
          groups: teacherRes.data.groups || [],
          subjects: teacherRes.data.subjects || [],
          totalHours: teacherRes.data.totalHours || 0,
          lessons: teacherRes.data.todayLessons || [],
        });

      } catch (err) {
        console.error("Хатои Schedule:", err);
      } finally {
        setIsScheduleLoading(false);
      }
    };

    fetchSchedule();
  }, [user, selectedDate]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 animate-pulse">
          <div className="h-12 bg-gray-200 rounded-xl w-96 mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded-2xl" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Панели Идоракунии Маъмур"
        description="Таҳлили пешрафта ва нишондиҳандаҳои асосӣ"
        actions={
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin/logs'}>
              <FolderPlus className="w-4 h-4 mr-2" />
              Амалҳои Система
            </Button>
          </div>
        }
      />

      {/* --- DEAN'S TEACHING VIEW (Refined) --- */}
      {user?.isDean && (
        <div className="mb-10 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Фаъолияти омӯзгории шумо</h2>
              <p className="text-slate-500 text-sm">Хулосаи ҳисоботи ҳафтаина ва дарсҳо</p>
            </div>
            <Button variant="outline" className="hidden sm:flex" onClick={() => navigate('/admin/schedule')}>
              Ҷадвали пурра <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-white border-none shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">{teacherData.groups.length}</h3>
                  <p className="text-sm text-slate-500 font-medium">Гурӯҳҳои фаъол</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">{teacherData.subjects.length}</h3>
                  <p className="text-sm text-slate-500 font-medium">Фанҳо</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">{teacherData.totalHours}</h3>
                  <p className="text-sm text-slate-500 font-medium">Соатҳои ҳафта</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Calendar & Schedule Grid (Refactored to match Journal Design) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Calendar */}
            <div className="lg:col-span-4">
              <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur h-full">
                <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-xl p-6">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <CalendarDays className="h-6 w-6" />
                    Интихоби рӯз
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 p-6">
                  <div className="flex justify-center mb-6">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      disabled={(date) => !isDateInCurrentWeek(date)} // Disable outside current week
                      weekStartsOn={1} // Start week on Monday
                      className="rounded-2xl border-2 border-indigo-100 p-3 w-fit"
                      classNames={{
                        head_cell: "text-slate-400 font-normal text-sm",
                        cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-indigo-50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                        day: "h-10 w-10 p-0 font-normal aria-selected:opacity-100 rounded-full hover:bg-slate-100 transition-all aria-disabled:opacity-30 aria-disabled:cursor-not-allowed",
                        day_selected: "bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white focus:bg-indigo-700 focus:text-white shadow-md",
                        day_today: "bg-slate-100 text-slate-900 font-bold",
                      }}
                    />
                  </div>

                  <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl text-center shadow-inner">
                    <p className="text-5xl font-bold text-indigo-700 mb-1">
                      {format(selectedDate, "dd")}
                    </p>
                    <p className="text-xl font-semibold text-indigo-600 capitalize">
                      {format(selectedDate, "MMMM yyyy")}
                    </p>
                    <p className="text-sm text-indigo-500 font-medium mt-1 capitalize">
                      {format(selectedDate, "EEEE")}
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-2 text-indigo-400 text-xs font-semibold bg-white/50 py-1 px-3 rounded-full w-fit mx-auto border border-indigo-100">
                      <Lock className="w-3 h-3" />
                      Фақат ҳафтаи ҷорӣ
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Schedule List */}
            <div className="lg:col-span-8">
              <Card className="shadow-2xl border-0 overflow-hidden min-h-[600px]">
                <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-2xl font-bold flex items-center gap-3">
                        Журнали гурӯҳ
                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-normal">
                          {user?.fullName || "Муаллим"}
                        </span>
                      </CardTitle>
                      <p className="text-indigo-100 mt-2 opacity-90">
                        {format(selectedDate, "EEEE, dd MMMM yyyy")}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 bg-slate-50/50 min-h-[500px]">
                  <div className="space-y-4">
                    {isScheduleLoading ? (
                      // Loading Skeletons
                      [...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-pulse flex items-center justify-between gap-4">
                          <div className="flex gap-4 w-full">
                            <div className="w-16 h-16 bg-slate-200 rounded-2xl shrink-0"></div>
                            <div className="flex flex-col gap-2 w-full">
                              <div className="h-4 bg-slate-200 rounded-full w-24"></div>
                              <div className="h-6 bg-slate-200 rounded-md w-3/4"></div>
                              <div className="h-4 bg-slate-200 rounded-md w-1/2"></div>
                            </div>
                          </div>
                          <div className="h-10 w-10 bg-slate-200 rounded-full shrink-0"></div>
                        </div>
                      ))
                    ) : teacherData.lessons.length > 0 ? (
                      teacherData.lessons.map((lesson: any, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            const dateStr = format(selectedDate, "yyyy-MM-dd");
                            navigate(`/admin/journal/${dateStr}/${lesson.shift}/${lesson.lessonNumber}/${lesson.groupId}/${lesson.subjectId}`);
                          }}
                          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between hover:shadow-xl transition-all cursor-pointer group active:scale-[0.99] gap-4"
                        >
                          <div className="flex gap-4 items-start">
                            <div className="flex flex-col items-center justify-center bg-indigo-50 w-16 h-16 rounded-2xl text-indigo-600 shrink-0">
                              <span className="text-xs font-bold uppercase text-indigo-400">Дарс</span>
                              <span className="text-2xl font-bold">{lesson.lessonNumber}</span>
                            </div>

                            <div className="flex flex-col gap-1">
                              <div className="w-fit px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 mb-1">
                                {format(selectedDate, "MMMM d, yyyy")}
                              </div>
                              <h4 className="font-bold text-slate-800 text-xl group-hover:text-indigo-600 transition-colors line-clamp-1">
                                {lesson.subject}
                              </h4>
                              <p className="text-slate-500 text-sm flex items-center gap-2">
                                <span>{lesson.lessonType === 'lecture' ? 'Лексия' : 'Амалӣ'}</span>
                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                <span>{lesson.group}</span>
                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                <span>Синфи {lesson.classroom}</span>
                              </p>
                            </div>
                          </div>

                          {/* Time & Arrow */}
                          <div className="flex items-center justify-between w-full md:w-auto gap-6 pl-20 md:pl-0">
                            <div className="text-right">
                              <span className="block text-slate-800 font-bold text-lg">{lesson.time}</span>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded ${lesson.isHeld ? "text-green-700 bg-green-100" : "text-amber-700 bg-amber-100"}`}>
                                {lesson.isHeld ? "Пур шудааст" : "Пур нашудааст"}
                              </span>
                            </div>
                            <div className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                              <ChevronRight className="w-5 h-5" />
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[400px] text-center">
                        <div className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center mb-6 shadow-inner animate-in zoom-in duration-500">
                          <Calendar className="w-16 h-16 text-indigo-300" />
                        </div>
                        <h4 className="text-2xl font-bold text-slate-700 mb-2">Дар ин рӯз дарс нест</h4>
                        <p className="text-slate-400 max-w-xs">
                          Шумо метавонед рӯзи дигарро аз тақвим интихоб кунед
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
      {/* --------------------------- */}

      {/* Статистика */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Ҳамаги донишҷӯён"
          value={stats.totalStudents}
          subtitle="Донишҷӯёни сабтиномшуда"
          icon={GraduationCap}
          color="primary"
        />
        <StatCard
          title="Давомоти Миёна"
          value={`${stats.attendanceRate}%`}
          subtitle="Дар 30 рӯзи охир"
          icon={Users}
          color="info"
        />
        <StatCard
          title="Баҳои Миёна"
          value={stats.avgGrade}
          subtitle="Дар сатҳи донишгоҳ"
          icon={PlusCircle}
          color="success"
        />
        <StatCard
          title="Ҳамаги гурӯҳҳо"
          value={stats.totalGroups}
          subtitle="Гурӯҳҳои академӣ"
          icon={Building2}
          color="warning"
        />
      </div>

      {/* Чартҳо (на иваз мекунам) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <AttendanceChart />
        <GradeDistributionChart />
      </div>

      {/* Навтарин + Гурӯҳҳо + High Absence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Гурӯҳҳои фаъол */}
        <Card>
          <CardHeader className="flex justify-between">
            <CardTitle>Гурӯҳҳои фаъол (Top 5)</CardTitle>
          </CardHeader>
          <CardContent>
            {topGroups.length === 0 ? <p className="text-muted-foreground p-4">Маълумот нест</p> :
              topGroups.map((group) => (
                <div
                  key={group.name}
                  className="p-3 bg-secondary/30 rounded-xl mb-2 flex justify-between"
                >
                  <div>
                    <p className="font-medium">{group.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{group.entryCount}</p>
                    <p className="text-xs text-muted-foreground">Сабтҳо</p>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>

        {/* 🔴 High Absence Students */}
        <Card className="border-red-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Донишҷӯёни бо ғоибии зиёд ({">"}48)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {highAbsence.length === 0 ? (
              <p className="text-muted-foreground p-4">Хушбахтона, чунин донишҷӯён нестанд</p>
            ) : (
              <div className="max-h-80 overflow-y-auto pr-2 space-y-2">
                {highAbsence.map((st, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-red-50 border border-red-100">
                    <div>
                      <p className="font-bold text-slate-800">{st.studentName}</p>
                      <p className="text-xs text-slate-500">{st.groupName}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-bold">
                        {st.absentCount}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </DashboardLayout >
  );
}
