// src/pages/admin/Students.tsx — бо модалкаи "Дидани маълумот"
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  UserPlus,
  MoreVertical,
  Mail,
  Eye,
  Trash,
  Pen,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import axios from "axios";
import { AddStudentModal } from "@/components/shared/studentAdd";
import { EditStudentModal } from "@/components/shared/studentEdit";
const Info = ({ label, value }: { label: string; value: any }) => (
  <div>
    <Label className="text-xs text-muted-foreground">{label}</Label>
    <p className="text-sm font-medium mt-0.5">{value}</p>
  </div>
);
export default function Students() {
  const [groups, setGroups] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false); // ← НАВИН: модалкаи дидан
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  const getGroups = async () => {
    try {
      const { data } = await axios.get(`${apiUrl}/groups`);
      setGroups(data);
    } catch (error) {
      console.error(error);
    }
  };

  const getStudents = async () => {
    try {
      const { data } = await axios.get(`${apiUrl}/students`);
      setStudents(data);
    } catch (error) {
      console.error(error);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Шумо мутмаин ҳастед, ки мехоҳед ин донишҷӯро пок кунед?"))
      return;
    try {
      await axios.delete(`${apiUrl}/students/${id}`);
      getStudents();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getGroups();
    getStudents();
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [open, setOpen] = useState(false);

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.fullName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCourse =
      selectedCourse === "all" || student.course === parseInt(selectedCourse);
    const matchesGroup =
      selectedGroup === "all" || student.group?._id === selectedGroup;
    return matchesSearch && matchesCourse && matchesGroup;
  });

  return (
    <DashboardLayout>
      <PageHeader
        title="Донишҷӯён"
        description={`Идоракунии ${students.length.toLocaleString()} донишҷӯён`}
        actions={
          <Button onClick={() => setOpen(true)} variant="gradient">
            <UserPlus className="w-4 h-4 mr-2" />
            Илова кардани донишҷӯ
          </Button>
        }
      />

      <AddStudentModal
        open={open}
        setOpen={setOpen}
        getStudents={getStudents}
        groups={groups}
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
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Ҷустуҷӯ аз рӯи ном..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Курс" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Ҳама курсҳо</SelectItem>
                  <SelectItem value="1">Курси 1</SelectItem>
                  <SelectItem value="2">Курси 2</SelectItem>
                  <SelectItem value="3">Курси 3</SelectItem>
                  <SelectItem value="4">Курси 4</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Гурӯҳ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Ҳама гурӯҳҳо</SelectItem>
                  {groups?.map((group) => (
                    <SelectItem key={group._id} value={group._id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Students Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card variant="default" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary/50 border-b border-border/50">
                  <th className="p-4 text-left font-semibold text-sm">
                    Донишҷӯ
                  </th>
                  <th className="p-4 text-left font-semibold text-sm">Гурӯҳ</th>
                  <th className="p-4 text-center font-semibold text-sm">
                    Курс
                  </th>
                  <th className="p-4 text-center font-semibold text-sm">
                    Ҳолат
                  </th>
                  <th className="p-4 text-right font-semibold text-sm">
                    Амалиётҳо
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr
                    key={student._id}
                    className="border-b border-border/30 hover:bg-secondary/20 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold">
                            {student.fullName?.charAt(0)?.toUpperCase() || "С"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.fullName}</p>
                          <p className="text-xs text-muted-foreground">
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary" className="font-medium">
                        {student.groupId || "Номуайян"}
                      </Badge>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-semibold">
                        {student.course}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <Badge
                        variant={
                          student.status === "active" ? "default" : "secondary"
                        }
                        className={cn(
                          student.status === "active"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-gray-100 text-gray-600"
                        )}
                      >
                        {student.status === "active" ? "Фаъол" : "Ғайрифаъол"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* Дидани маълумот */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedStudent(student);
                            setViewOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        {/* Таҳрир */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedStudent(student);
                            setEditOpen(true);
                          }}
                        >
                          <Pen className="w-4 h-4" />
                        </Button>

                        {/* Пок кардан */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteUser(student._id)}
                        >
                          <Trash className="w-4 h-4 text-rose-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-border/50 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Нишон додани {filteredStudents.length} аз {students.length}{" "}
              донишҷӯ
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Пешта
              </Button>
              <Button variant="outline" size="sm">
                Баъдӣ
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Модалкаи таҳрир */}
      <EditStudentModal
        open={editOpen}
        setOpen={setEditOpen}
        student={selectedStudent}
        getStudents={getStudents}
        groups={groups}
      />

      {/* НАВИН: Модалкаи дидани маълумот */}
      {/* НАВИН: Модалкаи дидани маълумот бо парол */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
  <DialogContent className="max-w-2xl p-5">
    <DialogHeader>
      <DialogTitle className="text-xl font-semibold flex items-center gap-3">
        <Avatar className="w-12 h-12">
          <AvatarFallback className="text-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            {selectedStudent?.fullName?.charAt(0)?.toUpperCase() || "С"}
          </AvatarFallback>
        </Avatar>
        Маълумоти донишҷӯ
      </DialogTitle>
      <DialogDescription className="text-sm">
        Маълумоти пурра дар бораи {selectedStudent?.fullName}
      </DialogDescription>
    </DialogHeader>

    {selectedStudent && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
        {/* Чап */}
        <div className="space-y-4">
          <Info label="Ному насаб" value={selectedStudent.fullName} />
          <Info label="Email" value={selectedStudent.email} />
          
          <div>
            <Label className="text-xs text-muted-foreground">Парол (hash)</Label>
            <p className="text-xs font-mono break-all bg-muted p-2 rounded">
              {selectedStudent.password}
            </p>
          </div>

          <Info label="Телефон" value={selectedStudent.phone || "—"} />
          <Info
            label="Санаи таваллуд"
            value={selectedStudent.birthDate || "—"}
          />
        </div>

        {/* Рост */}
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Гурӯҳ</Label>
            <Badge variant="secondary" className="mt-1">
              {selectedStudent.group?.name || "Номуайян"}
            </Badge>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Курс</Label>
            <p className="text-lg font-semibold">
              {selectedStudent.course} курс
            </p>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Ҳолат</Label>
            <Badge
              className={cn(
                "mt-1",
                selectedStudent.status === "active"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-gray-100 text-gray-600"
              )}
            >
              {selectedStudent.status === "active" ? "Фаъол" : "Ғайрифаъол"}
            </Badge>
          </div>

          <Info
            label="Санаи бақайдгирӣ"
            value={new Date(selectedStudent.createdAt).toLocaleDateString("tg-TJ")}
          />

          <div>
            <Label className="text-xs text-muted-foreground">ID</Label>
            <p className="text-xs font-mono bg-muted p-2 rounded break-all">
              {selectedStudent._id}
            </p>
          </div>
        </div>
      </div>
    )}

    <div className="flex justify-end gap-2 mt-6">
      <Button size="sm" variant="outline" onClick={() => setViewOpen(false)}>
        Пӯшидан
      </Button>
      <Button
        size="sm"
        onClick={() => {
          setEditOpen(true);
          setViewOpen(false);
        }}
      >
        Таҳрир
      </Button>
    </div>
  </DialogContent>
</Dialog>

    </DashboardLayout>
  );
}
