import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  FolderPlus,
  Eye,
  Edit,
  Building2,
  Trash,
  FileText,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import ModalAddGroup from "@/components/shared/modalAddGroupModal";
import { EditGroupModal } from "@/components/shared/editGroupModal";
import { Link } from "react-router-dom";
type User = {
  role: "admin" | "teacher" | "student";
};
export default function Groups() {
  let [groups, setGroups] = useState([]);
  let [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const user: User | null = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") as string)
    : null;
  const apiUrl = import.meta.env.VITE_API_URL;

  async function getGroups() {
    try {
      let { data } = await axios.get(`${apiUrl}/groups`);
      setGroups(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function deleteGroup(id: any) {
    try {
      await axios.delete(`${apiUrl}/groups/${id}`);
      getGroups();
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    getGroups();
  }, []);

  return (
    <DashboardLayout>
      {user?.role == "admin" ? (
        <PageHeader
          title="Гурӯҳҳо"
          description={`Идоракунии ${groups?.length} гурӯҳҳои академӣ`}
          actions={
            <Button onClick={() => setOpen(true)} variant="gradient">
              <FolderPlus className="w-4 h-4" />
              Гурӯҳ илова кун
            </Button>
          }
        />
      ) : null}

      <ModalAddGroup open={open} setOpen={setOpen} getGroups={getGroups} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {groups?.map((group, idx) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card variant="interactive" className="h-full">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <Badge variant="secondary" className="font-semibold">
                    Курс {group.course}
                  </Badge>
                </div>

                <h3 className="text-xl font-bold mb-1">
                  {group.name} ({group.id}) ({group.shift})
                </h3>

                <p className="text-sm text-muted-foreground mb-4">
                  {group.faculty}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-secondary/30">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Users className="w-4 h-4" />
                      <span className="text-xs">Донишҷӯён</span>
                    </div>
                    <p className="text-lg font-bold">{group.studentCount}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-secondary/30">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <BookOpen className="w-4 h-4" />
                      <span className="text-xs">Фанҳо</span>
                    </div>
                    <p className="text-lg font-bold">{group.subjectCount}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {/* Тугмаи журнал */}
                  <Button
                    asChild
                    variant="default"
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {user?.role == "admin" ? (
                    <Link to={`/admin/journal/group/${group._id}`}>
                      <FileText className="w-4 h-4 mr-1" />
                      Журнал
                    </Link> ): <Link to={`/teacher/journal/group/${group._id}`}>
                      <FileText className="w-4 h-4 mr-1" />
                      Журнал
                    </Link> }
                  </Button>
                  {user?.role == "admin" ? (
                    <Button
                      onClick={() => deleteGroup(group._id)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  ) : null}
                  {user?.role == "admin" ? (
                  <Button
                    onClick={() => {
                      setSelectedGroup(group);
                      setEditOpen(true);
                    }}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4" />
                    Таҳрир
                  </Button> ):null}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {selectedGroup && (
        <EditGroupModal
          open={editOpen}
          setOpen={setEditOpen}
          group={selectedGroup}
          getGroups={getGroups}
        />
      )}
    </DashboardLayout>
  );
}
