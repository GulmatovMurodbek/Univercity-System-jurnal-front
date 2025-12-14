import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Download, Filter } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { GradeBadge } from '@/components/shared/GradeBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { students, groups, subjects, generateGrades } from '@/data/mockData';
import { cn } from '@/lib/utils';

function getGradeColorClass(score: number): string {
  if (score >= 90) return 'bg-grade-excellent/20 text-grade-excellent';
  if (score >= 75) return 'bg-grade-good/20 text-grade-good';
  if (score >= 60) return 'bg-grade-satisfactory/20 text-grade-satisfactory';
  return 'bg-grade-poor/20 text-grade-poor';
}

export default function GradeJournal() {
  const [selectedGroup, setSelectedGroup] = useState(groups[0].id);
  const [selectedSubject, setSelectedSubject] = useState(subjects[0].id);
  const [grades, setGrades] = useState(generateGrades);

  const handleGradeChange = (
    studentId: string,
    field: 'homework' | 'midterm' | 'final',
    value: string
  ) => {
    const numValue = Math.max(
      0,
      Math.min(field === 'homework' ? 20 : field === 'midterm' ? 30 : 50, parseInt(value) || 0)
    );
    
    setGrades((prev) =>
      prev.map((grade) => {
        if (grade.studentId === studentId) {
          const updated = { ...grade, [field]: numValue };
          updated.total = updated.homework + updated.midterm + updated.final;
          return updated;
        }
        return grade;
      })
    );
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Grade Journal"
        description="Manage student grades: Homework (20%), Midterm (30%), Final (50%)"
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button variant="gradient">
              <Save className="w-4 h-4" />
              Save
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Card variant="default">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select Group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-4 ml-auto text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-grade-excellent" />
                  <span>Excellent (90+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-grade-good" />
                  <span>Good (75-89)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-grade-satisfactory" />
                  <span>Satisfactory (60-74)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-grade-poor" />
                  <span>Poor (&lt;60)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Grade Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card variant="default" className="overflow-hidden">
          <CardHeader className="bg-secondary/30 border-b border-border/50">
            <CardTitle className="text-lg">
              {subjects.find((s) => s.id === selectedSubject)?.name} - {selectedGroup}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-secondary/50">
                    <th className="p-4 text-left font-semibold text-sm border-b border-border/50">
                      Student Name
                    </th>
                    <th className="p-4 text-center font-semibold text-sm border-b border-border/50">
                      <div>Homework</div>
                      <div className="text-xs font-normal text-muted-foreground">
                        Max: 20 (20%)
                      </div>
                    </th>
                    <th className="p-4 text-center font-semibold text-sm border-b border-border/50">
                      <div>Midterm</div>
                      <div className="text-xs font-normal text-muted-foreground">
                        Max: 30 (30%)
                      </div>
                    </th>
                    <th className="p-4 text-center font-semibold text-sm border-b border-border/50">
                      <div>Final</div>
                      <div className="text-xs font-normal text-muted-foreground">
                        Max: 50 (50%)
                      </div>
                    </th>
                    <th className="p-4 text-center font-semibold text-sm border-b border-border/50">
                      <div>Total</div>
                      <div className="text-xs font-normal text-muted-foreground">
                        Max: 100
                      </div>
                    </th>
                    <th className="p-4 text-center font-semibold text-sm border-b border-border/50">
                      Grade
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((grade, idx) => (
                    <tr
                      key={grade.studentId}
                      className="border-b border-border/30 hover:bg-secondary/10"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
                            {grade.studentName.charAt(0)}
                          </div>
                          <span className="font-medium">{grade.studentName}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <Input
                          type="number"
                          min={0}
                          max={20}
                          value={grade.homework}
                          onChange={(e) =>
                            handleGradeChange(
                              grade.studentId,
                              'homework',
                              e.target.value
                            )
                          }
                          className="w-20 text-center mx-auto"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <Input
                          type="number"
                          min={0}
                          max={30}
                          value={grade.midterm}
                          onChange={(e) =>
                            handleGradeChange(
                              grade.studentId,
                              'midterm',
                              e.target.value
                            )
                          }
                          className="w-20 text-center mx-auto"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <Input
                          type="number"
                          min={0}
                          max={50}
                          value={grade.final}
                          onChange={(e) =>
                            handleGradeChange(
                              grade.studentId,
                              'final',
                              e.target.value
                            )
                          }
                          className="w-20 text-center mx-auto"
                        />
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={cn(
                            'inline-flex items-center justify-center w-14 h-10 rounded-xl font-bold text-lg',
                            getGradeColorClass(grade.total)
                          )}
                        >
                          {grade.total}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <GradeBadge score={grade.total} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
}
