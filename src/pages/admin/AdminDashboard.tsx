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
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/shared/StatCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { AttendanceChart } from "@/components/charts/AttendanceChart";
import { GradeDistributionChart } from "@/components/charts/GradeDistributionChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { format } from "date-fns";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalGroups: 0,
    attendanceRate: 0,
    avgGrade: 0,
  });

  const [topGroups, setTopGroups] = useState<any[]>([]);
  const [highAbsence, setHighAbsence] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_API_URL;
  // Use React Router for navigation
  // import { useNavigate } from "react-router-dom"; // Need to ensure it's imported at top
  // But wait, existing code doesn't import useNavigate. I need to add it.

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

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

    fetchData();
  }, []);

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
