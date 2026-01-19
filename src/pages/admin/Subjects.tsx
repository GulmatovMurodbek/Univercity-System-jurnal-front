import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  PlusCircle,
  Clock,
  UserCircle,
  MapPin,
  Users,
  Truck,
  ArchiveX,
  Pen,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { subjects, teachers } from "@/data/mockData";
import axios from "axios";
import { AddSubjectModal } from "@/components/shared/AddSubjectModal";
import { EditSubjectModal } from "@/components/shared/editSubjectModal";

const subjectColors = [
  "from-blue-500 to-blue-600",
  "from-purple-500 to-purple-600",
  "from-emerald-500 to-emerald-600",
  "from-amber-500 to-amber-600",
  "from-rose-500 to-rose-600",
  "from-cyan-500 to-cyan-600",
  "from-indigo-500 to-indigo-600",
  "from-pink-500 to-pink-600",
];
type User = {
  role: "admin" | "teacher" | "student";
};
export default function Subjects() {
  const apiUrl = import.meta.env.VITE_API_URL;
  let [subjects, setSubjects] = useState([]);
  let [teachers, setTeachers] = useState([]);
  let [open, setOpen] = useState(false);
  let [openEdit, setOpenEdit] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState(null);
  let [groups, setGroups] = useState([])
  const handleEditClick = (subject) => {
    setSubjectToEdit(subject);
    setOpenEdit(true);
  };
  const user: User | null = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") as string)
    : null;
  async function getSubjects() {
    try {
      let { data } = await axios.get(`${apiUrl}/subjects`);
      setSubjects(data);
    } catch (error) {
      console.error(error);
    }
  }
  async function getTeachers() {
    try {
      const token = localStorage.getItem("token");
      let { data } = await axios.get(`${apiUrl}/teachers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTeachers(data);
    } catch (error) {
      console.error(error);
    }
  }
  async function getGroups() {
    try {
      let { data } = await axios.get(`${apiUrl}/groups`);
      setGroups(data)
    } catch (error) {
      console.error(error);
    }
  }
  async function deleteSubject(id: any) {
    try {
      await axios.delete(`${apiUrl}/subjects/${id}`)
      getSubjects()
    } catch (error) {
      console.error(error);
    }
  }
  useEffect(() => {
    getSubjects();
    if (user?.role === "admin") {
      getTeachers();
    }
    getGroups()
  }, []);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredSubjects = subjects.filter((subject: any) =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (

    <DashboardLayout>
      {user?.role == "admin" ? (
        <PageHeader
          title="Subjects"
          description={`Showing ${filteredSubjects.length} of ${subjects.length} subjects`}
          actions={
            <Button onClick={() => setOpen(true)} variant="gradient">
              <PlusCircle className="w-4 h-4" />
              Илова кардани фан
            </Button>
          }
        />) : null}

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Ҷустуҷӯи фан..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border bg-card shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <svg
            className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {filteredSubjects?.map((subject: any, idx) => (
          <motion.div
            key={subject.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card variant="interactive" className="h-full overflow-hidden">
              <div
                className={`h-2 bg-gradient-to-r ${subjectColors[idx % subjectColors?.length]
                  }`}
              />
              <CardContent className="p-5">
                <h3 className="font-bold text-lg mb-3">{subject.name}</h3>

                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {subject?.creditHours} credit hours
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserCircle className="w-4 h-4 text-muted-foreground" />
                    {subject?.teachers?.map((teacher: any) => {
                      return (
                        <span
                          key={teacher.teacherId}
                          className="text-muted-foreground truncate"
                        >
                          {teacher?.teacherName} ,
                        </span>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Room {subject?.classroom}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <Badge variant="secondary" className="text-xs">
                      {subject?.groupId}
                    </Badge>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between text-xs">
                    {user?.role == "admin" ? (
                      <Button onClick={() => deleteSubject(subject._id)} className="bg-[#ff5757] p-3">
                        <ArchiveX />
                      </Button>) : null}
                    {user?.role == "admin" ? (
                      <Button onClick={() => handleEditClick(subject)} className="bg-[#2626ff] p-3">
                        <Pen />
                      </Button>) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
      <AddSubjectModal
        open={open}
        setOpen={setOpen}
        getSubjects={getSubjects}
        teachers={teachers}
      />
      <EditSubjectModal open={openEdit} setOpen={setOpenEdit} subjectToEdit={subjectToEdit} getSubjects={getSubjects} teachers={teachers} />
    </DashboardLayout>
  );
}
