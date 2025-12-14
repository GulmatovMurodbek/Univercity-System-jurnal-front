import React from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Building2,
  GraduationCap,
  Award,
  Calendar,
  BookOpen,
  TrendingUp,
  Edit,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const gradeProgressData = [
  { week: 'W1', gpa: 3.5 },
  { week: 'W2', gpa: 3.55 },
  { week: 'W3', gpa: 3.6 },
  { week: 'W4', gpa: 3.65 },
  { week: 'W5', gpa: 3.7 },
  { week: 'W6', gpa: 3.68 },
  { week: 'W7', gpa: 3.72 },
  { week: 'W8', gpa: 3.75 },
];

const attendanceData = [
  { month: 'Sep', rate: 96 },
  { month: 'Oct', rate: 94 },
  { month: 'Nov', rate: 92 },
  { month: 'Dec', rate: 95 },
];

export default function StudentProfile() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <PageHeader
        title="My Profile"
        description="View and manage your student profile"
        actions={
          <Button variant="outline">
            <Edit className="w-4 h-4" />
            Edit Profile
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1"
        >
          <Card variant="gradient" className="h-full">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-3xl gradient-hero mx-auto mb-4 flex items-center justify-center text-4xl text-primary-foreground font-bold shadow-glow">
                  {user?.name?.charAt(0)}
                </div>
                <h2 className="text-xl font-bold">{user?.name}</h2>
                <p className="text-muted-foreground">Student</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">
                      {user?.name?.toLowerCase().replace(' ', '.')}@student.edu
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                  <Building2 className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Faculty</p>
                    <p className="text-sm font-medium">{user?.faculty}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                  <GraduationCap className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Course / Group</p>
                    <p className="text-sm font-medium">
                      Course {user?.course} / {user?.group}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                  <Award className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">GPA</p>
                    <p className="text-sm font-bold text-primary">
                      {user?.gpa?.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats & Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card variant="stat">
              <CardContent className="p-4 text-center">
                <BookOpen className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">8</p>
                <p className="text-xs text-muted-foreground">Subjects</p>
              </CardContent>
            </Card>
            <Card variant="stat">
              <CardContent className="p-4 text-center">
                <Calendar className="w-8 h-8 text-status-success mx-auto mb-2" />
                <p className="text-2xl font-bold">94%</p>
                <p className="text-xs text-muted-foreground">Attendance</p>
              </CardContent>
            </Card>
            <Card variant="stat">
              <CardContent className="p-4 text-center">
                <Award className="w-8 h-8 text-status-warning mx-auto mb-2" />
                <p className="text-2xl font-bold">96</p>
                <p className="text-xs text-muted-foreground">Credits</p>
              </CardContent>
            </Card>
            <Card variant="stat">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-status-info mx-auto mb-2" />
                <p className="text-2xl font-bold">#12</p>
                <p className="text-xs text-muted-foreground">Rank</p>
              </CardContent>
            </Card>
          </div>

          {/* GPA Progress Chart */}
          <Card variant="default">
            <CardHeader>
              <CardTitle className="text-lg">GPA Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={gradeProgressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="week"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <YAxis
                      domain={[3.4, 4.0]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="gpa"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Progress */}
          <Card variant="default">
            <CardHeader>
              <CardTitle className="text-lg">Attendance by Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attendanceData.map((month) => (
                  <div key={month.month}>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-medium">{month.month}</span>
                      <span className="text-muted-foreground">{month.rate}%</span>
                    </div>
                    <Progress value={month.rate} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
