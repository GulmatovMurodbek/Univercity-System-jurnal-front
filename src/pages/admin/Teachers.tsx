import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, Mail, Phone, BookOpen, Eye, Trash, RefreshCw } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import AddTeacherModal from "@/components/shared/addTeacher";
import ViewTeacherModal from "@/components/shared/ViewTeacherModal";
import { useToast } from "@/components/ui/use-toast";

interface Teacher {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  subjects: string[];
  dateOfBirth?: string;
  createdAt: string;
}

export default function Teachers() {
  const { toast } = useToast();
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;

  // Helper to get token
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      headers: { Authorization: `Bearer ${token}` },
    };
  };

  async function getTeachers() {
    try {
      setLoading(true);
      const { data } = await axios.get(`${apiUrl}/teachers`, getAuthHeaders());
      setTeachers(data);
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error fetching teachers",
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleAddTeacher = async (data: any) => {
    try {
      await axios.post(`${apiUrl}/teachers`, data, getAuthHeaders());
      toast({
        title: "Success",
        description: "Teacher added successfully",
        variant: "default",
      });
      setOpenAdd(false);
      getTeachers();
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error adding teacher",
        description: err.response?.data?.message || "Failed to add teacher",
        variant: "destructive",
      });
    }
  };

  async function deleteTeacher(id: string) {
    if (!confirm("Are you sure you want to delete this teacher?")) return;

    try {
      await axios.delete(`${apiUrl}/teachers/${id}`, getAuthHeaders());
      toast({
        title: "Success",
        description: "Teacher deleted successfully",
      });
      getTeachers();
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error deleting teacher",
        description: error.response?.data?.message || "Failed to delete teacher",
        variant: "destructive",
      });
    }
  }

  useEffect(() => {
    getTeachers();
  }, []);

  return (
    <DashboardLayout>
      <PageHeader
        title="Устодон"
        description={`Ҳамаги ${teachers?.length || 0} устодон`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={getTeachers}>
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button onClick={() => setOpenAdd(true)} variant="gradient">
              <UserPlus className="w-4 h-4 mr-2" />
              Устод ворид кардан
            </Button>
          </div>
        }
      />
      <AddTeacherModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSubmit={handleAddTeacher}
      />

      {loading && teachers.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {teachers?.map((teacher, idx) => (
            <motion.div
              key={teacher._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card variant="interactive" className="h-full">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center text-xl text-primary-foreground font-bold shrink-0">
                      {teacher?.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold truncate text-lg">{teacher?.fullName}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Teacher
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground truncate" title={teacher?.email}>
                        {teacher?.email}
                      </span>
                    </div>

                    {teacher.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">
                          {teacher.phone}
                        </span>
                      </div>
                    )}

                    <div className="flex items-start gap-2">
                      <BookOpen className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex flex-wrap gap-1">
                        {teacher?.subjects && teacher.subjects.length > 0 ? (
                          teacher.subjects.map((subject, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="text-xs"
                            >
                              {subject}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground italic">No subjects</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between gap-3 mt-auto pt-4 border-t border-gray-100">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                      onClick={() => {
                        setSelectedTeacher(teacher);
                        setViewOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button
                      onClick={() => deleteTeacher(teacher._id)}
                      variant="outline"
                      size="sm"
                      className="flex-1 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                    >
                      <Trash className="w-4 h-4 mr-2 text-red-500" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      <ViewTeacherModal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        teacher={selectedTeacher}
      />
    </DashboardLayout>
  );
}
