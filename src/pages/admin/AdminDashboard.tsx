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
    totalTeachers: 0,
    totalGroups: 0,
    totalSubjects: 0,
  });

  const [recentStudents, setRecentStudents] = useState<any[]>([]);
  const [groupsOverview, setGroupsOverview] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // API-ҳои сода:
        const [studentsRes, teachersRes, groupsRes, subjectsRes] =
          await Promise.all([
            axios.get(`${apiUrl}/students`, { headers }),
            axios.get(`${apiUrl}/teachers`, { headers }),
            axios.get(`${apiUrl}/groups`, { headers }),
            axios.get(`${apiUrl}/subjects`, { headers }), // агар надорӣ → автомат 0 мешавад
          ]);

        // Танҳо length
        setStats({
          totalStudents: Array.isArray(studentsRes.data) ? studentsRes.data.length : 0,
          totalTeachers: Array.isArray(teachersRes.data) ? teachersRes.data.length : 0,
          totalGroups: Array.isArray(groupsRes.data) ? groupsRes.data.length : 0,
          totalSubjects: Array.isArray(subjectsRes.data) ? subjectsRes.data.length : 0,
        });

        // Барои Навтарин донишҷӯён → танҳо 4 дона
        if (Array.isArray(studentsRes.data)) {
          setRecentStudents(studentsRes.data.slice(0, 4));
        } else {
          console.warn("Unexpected students data format:", studentsRes.data);
          setRecentStudents([]);
        }

        // Барои Намуди гурӯҳҳо → 4 дона
        let groupsData = [];
        if (Array.isArray(groupsRes.data)) {
          groupsData = groupsRes.data;
        } else {
          console.warn("Unexpected groups data format:", groupsRes.data);
        }

        const studentsData = Array.isArray(studentsRes.data) ? studentsRes.data : [];

        const groupsWithCount = groupsData.map((g: any) => ({
          ...g,
          studentCount: studentsData.filter(
            (s: any) => s.group === g._id
          ).length,
        }));

        setGroupsOverview(groupsWithCount.slice(0, 4));
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
        description="Намоиши умумии низоми донишгоҳ"
        actions={
          <div className="flex gap-2 flex-wrap">
            <Button variant="gradient" size="sm">
              <UserPlus className="w-4 h-4" />
              Доштани донишҷӯ
            </Button>
            <Button variant="outline" size="sm">
              <FolderPlus className="w-4 h-4" />
              Доштани гурӯҳ
            </Button>
            <Button variant="outline" size="sm">
              <PlusCircle className="w-4 h-4" />
              Доштани фан
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
          title="Ҳамаги устодон"
          value={stats.totalTeachers}
          subtitle="Устодони фаъол"
          icon={Users}
          color="info"
        />
        <StatCard
          title="Ҳамаги гурӯҳҳо"
          value={stats.totalGroups}
          subtitle="Гурӯҳҳои академӣ"
          icon={Building2}
          color="success"
        />
        <StatCard
          title="Ҳамаги фанҳо"
          value={stats.totalSubjects}
          subtitle="Фанҳои дастрас"
          icon={BookOpen}
          color="warning"
        />
      </div>

      {/* Чартҳо (на иваз мекунам) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <AttendanceChart />
        <GradeDistributionChart />
      </div>

      {/* Навтарин + Гурӯҳҳо */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Навтарин донишҷӯён */}
        <Card>
          <CardHeader className="flex justify-between">
            <CardTitle>Навтарин донишҷӯён</CardTitle>
          </CardHeader>
          <CardContent>
            {recentStudents.map((student) => (
              <div
                key={student._id}
                className="p-3 bg-secondary/30 rounded-xl mb-2 flex justify-between"
              >
                <div>
                  <p className="font-medium">{student.fullName}</p>

                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Намуди гурӯҳҳо */}
        <Card>
          <CardHeader className="flex justify-between">
            <CardTitle>Намуди гурӯҳҳо</CardTitle>
          </CardHeader>
          <CardContent>
            {groupsOverview.map((group) => (
              <div
                key={group._id}
                className="p-3 bg-secondary/30 rounded-xl mb-2 flex justify-between"
              >
                <div>
                  <p className="font-medium">{group.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {group.faculty ?? "Факултет нест"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{group.studentCount}</p>
                  <p className="text-xs text-muted-foreground">Донишҷӯён</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
