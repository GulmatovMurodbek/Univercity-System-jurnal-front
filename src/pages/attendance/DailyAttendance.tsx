// src/pages/attendance/JournalByGroupPage.tsx — НИҲОӢ ВА БО ҲИМОЯ
import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { ru } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FileText, ArrowLeft, CalendarDays, Clock, User, UserPlus, Users, Lock, Trash2 } from "lucide-react";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { AddStudentsToGroupModal } from "@/components/shared/addStudentToGroup";
import { cn } from "@/lib/utils";

interface Lesson {
  subjectName: string;
  subjectId: string; // ← ИЛОВА
  teacherName: string;
  teacherId: string; // ← ИЛОВА: ID-и муаллим
  shift: 1 | 2;
  slot: number;
}

interface Student {
  _id: string;
  fullName: string;
}

export default function JournalByGroupPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [groupName, setGroupName] = useState<string>("Гурӯҳ");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;
  const today = new Date();
  const isToday = format(selectedDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");

  // Гирифтани дарсҳо барои рӯзи интихобшуда
  const fetchLessonsForDate = async (date: Date) => {
    setLoading(true);
    const formattedDate = format(date, "yyyy-MM-dd");

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${apiUrl}/journal/group/${groupId}/${formattedDate}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      let fetchedLessons = res.data.lessons || [];

      // Агар муаллим бошад — фақат дарсҳои худ-ашро нишон медиҳем
      if (user?.role === "teacher") {
        fetchedLessons = fetchedLessons.filter(
          (lesson: Lesson) => lesson.teacherId === user._id
        );
      }

      // Агар рӯзи гузашта бошад — муаллим наметавонад кушояд
      if (!isToday && user?.role === "teacher") {
        fetchedLessons = [];
      }

      setLessons(fetchedLessons);
      setGroupName(res.data.groupName || "Гурӯҳ");
    } catch (err: any) {
      console.error("Хатогӣ дар гирифтани дарсҳо:", err);
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupStudents = async () => {
    if (!groupId) return;
    setStudentsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${apiUrl}/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data.students || []);
    } catch (err) {
      console.error(err);
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  };


  const handleRemoveStudent = async (studentId: string) => {
    if (!confirm("Оё шумо мутмаин ҳастед, ки ин донишҷӯро аз гурӯҳ хориҷ кардан мехоҳед?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${apiUrl}/groups/remove-student`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { groupId, studentId },
      });

      // Update UI locally
      setStudents((prev) => prev.filter((s) => s._id !== studentId));
    } catch (err) {
      console.error("Хатогӣ ҳангоми хориҷ кардани донишҷӯ:", err);
      alert("Хатогӣ рӯй дод. Лутфан такрор кунед.");
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchLessonsForDate(selectedDate);
      fetchGroupStudents();
    }
  }, [groupId, selectedDate, user]);

  const zonedDate = toZonedTime(selectedDate, "Asia/Dushanbe");

  const getLessonTime = (shift: 1 | 2, slot: number) => {
    const base = shift === 1 ? 8 : 13;
    const start = base + (slot - 1);
    return `${start}:00 – ${start}:50`;
  };

  // Санҷиши имкони кушодани журнал
  const canOpenJournal = (lesson: Lesson) => {
    if (user?.role === "admin") return true;
    if (user?.role === "teacher") {
      return isToday && lesson.teacherId === user._id;
    }
    return false;
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto p-6 max-w-7xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="hover:bg-white/80 dark:hover:bg-slate-800 shadow-md"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Бозгашт
            </Button>

            {user?.role === "admin" && (
              <Button
                onClick={() => setAddModalOpen(true)}
                className="shadow-lg"
                size="lg"
              >
                <UserPlus className="mr-3 h-5 w-5" />
                Донишҷӯ илова кардан
              </Button>
            )}
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* Части чап */}
            <div className="lg:col-span-4 space-y-8">
              {/* Календар */}
              <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur">
                  <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-2xl">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <CalendarDays className="h-7 w-7" />
                      Интихоби рӯз
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <Calendar
                      mode="single"
                      selected={zonedDate}
                      onSelect={(d) => d && setSelectedDate(d)}
                      locale={ru}
                      className="rounded-2xl border-2 border-indigo-100"
                      disabled={user?.role === "teacher"
                        ? (date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const checkDate = new Date(date);
                          checkDate.setHours(0, 0, 0, 0);
                          return checkDate.getTime() !== today.getTime();
                        }
                        : undefined
                      }
                    />
                    <div className="mt-6 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl text-center">
                      <p className="text-4xl font-bold text-indigo-700">
                        {format(zonedDate, "dd")}
                      </p>
                      <p className="text-lg font-semibold text-indigo-600 mt-2">
                        {format(zonedDate, "MMMM yyyy", { locale: ru })}
                      </p>
                      <p className="text-sm text-indigo-500 font-medium">
                        {format(zonedDate, "EEEE", { locale: ru })}
                      </p>
                      {!isToday && user?.role === "teacher" && (
                        <Badge variant="secondary" className="mt-4">
                          <Lock className="w-4 h-4 mr-2" />
                          Фақат имрӯз дастрас аст
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Рӯйхати донишҷӯён */}
              <Card className="shadow-2xl border-0">
                <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <Users className="h-6 w-6" />
                    Донишҷӯён ({students.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-96">
                    {studentsLoading ? (
                      <div className="p-6 space-y-4">
                        {[...Array(8)].map((_, i) => (
                          <Skeleton key={i} className="h-16 w-full rounded-xl" />
                        ))}
                      </div>
                    ) : students.length === 0 ? (
                      <div className="p-12 text-center text-muted-foreground">
                        <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>Донишҷӯён нест</p>
                      </div>
                    ) : (
                      <div className="p-4 space-y-3">
                        {students.map((student) => (
                          <div
                            key={student._id}
                            className="group flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted/80 transition relative"
                          >
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold">
                                {student.fullName.split(" ").map(n => n[0]).join("").toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-semibold text-lg">{student.fullName}</p>
                            </div>
                            {user?.role === "admin" && (
                              <Button
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleRemoveStudent(student._id)}
                                title="Хориҷ кардан аз гурӯҳ"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Қисми рост: Дарсҳо */}
            <div className="lg:col-span-8">
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <Card className="shadow-2xl border-0 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
                    <CardTitle className="text-3xl font-bold flex items-center gap-3">
                      Журнали гурӯҳ
                      <span className="bg-white/20 px-4 py-2 rounded-full text-lg">
                        {groupName}
                      </span>
                    </CardTitle>
                    <p className="text-xl text-indigo-100 mt-2">
                      {format(zonedDate, "EEEE, dd MMMM yyyy", { locale: ru })}
                    </p>
                  </CardHeader>

                  <CardContent className="pt-8">
                    {loading ? (
                      <div className="space-y-6">
                        {[...Array(4)].map((_, i) => (
                          <Skeleton key={i} className="h-32 w-full rounded-3xl" />
                        ))}
                      </div>
                    ) : lessons.length === 0 ? (
                      <div className="text-center py-20">
                        <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                          <CalendarDays className="w-16 h-16 text-indigo-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-600 dark:text-slate-300">
                          {user?.role === "teacher" && !isToday
                            ? "Фақат дарсҳои имрӯз дастрас аст"
                            : "Дар ин рӯз дарс нест"}
                        </h3>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {lessons.map((lesson, i) => {
                          const canOpen = canOpenJournal(lesson);

                          return (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 30 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.1 }}
                            >
                              <Card className={cn("overflow-hidden border-0 shadow-xl transition-all duration-300", canOpen ? "hover:shadow-2xl" : "opacity-75")}>
                                <div className="p-8">
                                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                    <div className="flex-1">
                                      <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">
                                        {lesson.subjectName}
                                      </h3>
                                      <div className="flex flex-wrap items-center gap-4 text-lg">
                                        <Badge variant="secondary" className="text-base px-4 py-2 flex items-center gap-2">
                                          <User className="w-4 h-4" />
                                          {lesson.teacherName}
                                        </Badge>
                                        <Badge variant="outline" className="text-base px-4 py-2 flex items-center gap-2">
                                          <Clock className="w-4 h-4" />
                                          {getLessonTime(lesson.shift, lesson.slot)}
                                        </Badge>
                                        <span className={`px-4 py-2 rounded-full text-white font-semibold ${lesson.shift === 1 ? "bg-blue-600" : "bg-purple-600"}`}>
                                          {lesson.shift === 1 ? "Басти 1" : "Басти 2"}
                                        </span>
                                      </div>
                                    </div>

                                    {canOpen ? (
                                      <Button
                                        asChild
                                        size="lg"
                                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-lg px-10 py-7 shadow-xl"
                                      >
                                        <Link
                                          to={`/${user?.role}/journal/${format(selectedDate, "yyyy-MM-dd")}/${lesson.shift === 1 ? "first" : "second"}/${lesson.slot}/${groupId}/${lesson.subjectId}`}
                                        >
                                          <FileText className="mr-3 h-6 w-6" />
                                          Кушодани журнал
                                        </Link>
                                      </Button>
                                    ) : (
                                      <div className="flex items-center gap-3 text-lg text-muted-foreground">
                                        <Lock className="w-6 h-6" />
                                        <span>Дастрас нест</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </Card>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Модалкаи илова кардани донишҷӯён (фақат админ) */}
        {user?.role === "admin" && (
          <AddStudentsToGroupModal
            open={addModalOpen}
            setOpen={setAddModalOpen}
            groupId={groupId!}
            groupName={groupName}
            onSuccess={fetchGroupStudents}
          />
        )}
      </div>
    </DashboardLayout>
  );
}