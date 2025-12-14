import React from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Building2,
  BookOpen,
  Clock,
  Users,
  Edit,
  Calendar,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { groups } from '@/data/mockData';

export default function TeacherProfile() {
  const { user } = useAuth();

  const myGroups = groups.slice(0, 4);

  return (
    <DashboardLayout>
      <PageHeader
        title="My Profile"
        description="View and manage your teacher profile"
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
        >
          <Card variant="gradient" className="h-full">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-3xl gradient-hero mx-auto mb-4 flex items-center justify-center text-4xl text-primary-foreground font-bold shadow-glow">
                  {user?.name?.charAt(0)}
                </div>
                <h2 className="text-xl font-bold">{user?.name}</h2>
                <p className="text-muted-foreground">Teacher</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">
                      {user?.name?.toLowerCase().replace(' ', '.').replace('dr. ', '')}@university.edu
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
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Weekly Hours</p>
                    <p className="text-sm font-medium">36 hours</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-secondary/30">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-5 h-5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Subjects</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {user?.subjects?.map((subject) => (
                      <Badge key={subject} variant="secondary">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats & Groups */}
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
                <p className="text-2xl font-bold">2</p>
                <p className="text-xs text-muted-foreground">Subjects</p>
              </CardContent>
            </Card>
            <Card variant="stat">
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-status-success mx-auto mb-2" />
                <p className="text-2xl font-bold">4</p>
                <p className="text-xs text-muted-foreground">Groups</p>
              </CardContent>
            </Card>
            <Card variant="stat">
              <CardContent className="p-4 text-center">
                <Calendar className="w-8 h-8 text-status-warning mx-auto mb-2" />
                <p className="text-2xl font-bold">36</p>
                <p className="text-xs text-muted-foreground">Hours/Week</p>
              </CardContent>
            </Card>
            <Card variant="stat">
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-status-info mx-auto mb-2" />
                <p className="text-2xl font-bold">110</p>
                <p className="text-xs text-muted-foreground">Students</p>
              </CardContent>
            </Card>
          </div>

          {/* My Groups */}
          <Card variant="default">
            <CardHeader>
              <CardTitle className="text-lg">My Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {myGroups.map((group) => (
                  <div
                    key={group.id}
                    className="p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{group.name}</h4>
                      <Badge variant="secondary">Course {group.course}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{group.studentCount} students</span>
                      <span>{group.faculty}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Schedule Summary */}
          <Card variant="default">
            <CardHeader>
              <CardTitle className="text-lg">This Week's Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      {day}
                    </p>
                    <div className="h-20 rounded-xl gradient-primary opacity-60" />
                    <p className="text-xs text-muted-foreground mt-1">6 lessons</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-center text-muted-foreground mt-4">
                Total: 36 lessons this week
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
