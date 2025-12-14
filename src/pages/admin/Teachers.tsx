import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, Mail, Clock, BookOpen, Eye, Trash } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import AddTeacherModal from "@/components/shared/addTeacher";
import ViewTeacherModal from "@/components/shared/ViewTeacherModal";

export default function Teachers() {
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const apiUrl = import.meta.env.VITE_API_URL;
  let [teachers, setTeachers] = useState([]);
  async function getTeachers() {
    try {
      let { data } = await axios.get(`${apiUrl}/teachers`);
      setTeachers(data);
    } catch (error) {
      console.log(error);
    }
  }
  const [openAdd, setOpenAdd] = useState(false);

  const handleAddTeacher = async (data: any) => {
    try {
      await axios.post(`${apiUrl}/teachers`, data);
      setOpenAdd(false);
      getTeachers();
    } catch (err) {
      console.log(err);
    }
  };
  async function deleteTeacher(id: any) {
    try {
      await axios.delete(`${apiUrl}/teachers/${id}`);
      getTeachers();
    } catch (error) {
      console.error(error);
    }
  }
  useEffect(() => {
    getTeachers();
  }, []);
  return (
    <DashboardLayout>
      <PageHeader
        title="Устодон"
        description={`Ҳамаги ${teachers?.length} устодон`}
        actions={
          <Button onClick={() => setOpenAdd(true)} variant="gradient">
            <UserPlus className="w-4 h-4" />
            Устод ворид кардан
          </Button>
        }
      />
      <AddTeacherModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSubmit={handleAddTeacher}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {teachers?.map((teacher, idx) => (
          <motion.div
            key={teacher.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card variant="interactive" className="h-full">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center text-xl text-primary-foreground font-bold">
                    {teacher?.fullName?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate">{teacher?.fullName}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {teacher?.faculty}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground truncate">
                      {teacher?.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {teacher?.weeklyHours} hours/week
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <BookOpen className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div className="flex flex-wrap gap-1">
                      {teacher?.subjects.map((subject: any) => (
                        <Badge
                          key={subject}
                          variant="secondary"
                          className="text-xs"
                        >
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-evenly">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-[130px]"
                    onClick={() => {
                      setSelectedTeacher(teacher);
                      setViewOpen(true);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => deleteTeacher(teacher?._id)}
                    variant="outline"
                    size="sm"
                    className="w-[130px]"
                  >
                    <Trash className="w-2 h-2 text-[red]" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
      <ViewTeacherModal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        teacher={selectedTeacher}
      />
    </DashboardLayout>
  );
}
