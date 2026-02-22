// src/pages/schedule/WeeklySchedulePage.tsx
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Edit3, Users, CalendarDays, Trash2, Loader2 } from "lucide-react";
import axios from "axios";
import { WeeklyScheduleModal } from "@/components/shared/WeeklyScheduleModal";
import { WeeklyScheduleGrid } from "@/components/schedule/WeeklyScheduleGrid";

interface Group {
  _id: string;
  name: string;
  shift: number;
  course: number;
}
type User = {
  role: "admin" | "teacher" | "student" | "mudir";
};

export default function WeeklySchedulePage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [selectedGroupName, setSelectedGroupName] = useState<string>("");
  const [shift, setShift] = useState<1 | 2>(1);
  const [semester, setSemester] = useState<1 | 2>(1);
  const [weeklySchedule, setWeeklySchedule] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const user: User | null = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") as string)
    : null;
  const apiUrl = import.meta.env.VITE_API_URL;

  // Семестр аз рӯйи сана
  useEffect(() => {
    const month = new Date().getMonth();
    setSemester(month >= 1 && month <= 5 ? 2 : 1);
  }, []);

  // Гирифтани гурӯҳҳо ва фанҳо
  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      axios.get(`${apiUrl}/groups`, { headers }),
      axios.get(`${apiUrl}/subjects`, { headers }),
    ])
      .then(([groupsRes, subjectsRes]) => {
        setGroups(groupsRes.data);
        setSubjects(subjectsRes.data);
      })
      .catch(console.error);
  }, [apiUrl]);

  // Гирифтани ҷадвал
  const fetchSchedule = () => {
    if (!selectedGroup) {
      setWeeklySchedule(null);
      setSelectedGroupName("");
      setShift(1);
      return;
    }
    if (selectedGroup === "ALL") {
      setSelectedGroupName("Ҳамаи гурӯҳҳо");
    } else {
      const group = groups.find((g) => g._id === selectedGroup);
      if (group) {
        setSelectedGroupName(`${group.name} (Курси ${group.course})`);
        setShift(group.shift === 2 ? 2 : 1);
      }
    }
    setLoading(true);
    setWeeklySchedule(null);
    const token = localStorage.getItem("token");
    axios
      .get(`${apiUrl}/weeklySchedule/group/${selectedGroup}`, {
        params: { semester },
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setWeeklySchedule(res.data))
      .catch(() => setWeeklySchedule(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSchedule();
  }, [selectedGroup, groups, semester]);

  const handleGroupChange = (groupId: string) => setSelectedGroup(groupId);

  // ── Удалити ҷадвал ──────────────────────────────────────────────────────────
  const handleDeleteSchedule = async () => {
    if (!selectedGroup || selectedGroup === "ALL") return;
    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${apiUrl}/weeklySchedule/group/${selectedGroup}`, {
        params: { semester },
        headers: { Authorization: `Bearer ${token}` },
      });
      setWeeklySchedule(null);
    } catch (err) {
      console.error(err);
      alert("Хатогӣ ҳангоми пок кардан!");
    } finally {
      setDeleting(false);
    }
  };

  // Рӯзи ҷорӣ ва дарси ҷорӣ
  const today = new Date().getDay();
  const currentDayIndex = today === 0 ? 5 : today - 1;
  const hour = new Date().getHours();
  const mins = new Date().getMinutes();
  const totalMins = hour * 60 + mins;

  // 90-дақиқа калкулятор
  let currentLesson: number;
  if (shift === 1) {
    if (totalMins < 570) currentLesson = 1; // <09:30
    else if (totalMins < 670) currentLesson = 2; // <11:10
    else currentLesson = 3;
  } else {
    if (totalMins < 870) currentLesson = 1; // <14:30
    else if (totalMins < 970) currentLesson = 2; // <16:10
    else currentLesson = 3;
  }

  const isAdmin = user?.role === "admin" || user?.role === "mudir";

  return (
    <DashboardLayout>
      <div className="space-y-8 p-4 md:p-8">
        <PageHeader
          title="Ҷадвали ҳафтаина"
          description="Идоракунии ҷадвали дарсҳо барои гурӯҳҳо"
        />

        {/* Toolbar */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col xl:flex-row gap-4 xl:items-center justify-between">
              <div className="w-full overflow-x-auto pb-2 xl:pb-0 no-scrollbar">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center min-w-max xl:min-w-0">
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-primary shrink-0" />
                    <Select value={selectedGroup} onValueChange={handleGroupChange}>
                      <SelectTrigger className="w-[300px] sm:w-[320px] lg:w-[400px] h-12 text-lg px-4 shadow-sm bg-white">
                        <span className="truncate w-full text-left">
                          {selectedGroupName || <span className="text-muted-foreground">Гурӯҳро интихоб кунед</span>}
                        </span>
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px] overflow-y-auto">
                        <SelectItem value="ALL">
                          <div className="flex items-center gap-3 font-bold text-primary">
                            <Users className="w-5 h-5" />
                            Ҳамаи гурӯҳҳо
                          </div>
                        </SelectItem>
                        {groups.map((g) => (
                          <SelectItem key={g._id} value={g._id} className="cursor-pointer py-3">
                            <div className="flex flex-col gap-1 w-full max-w-[320px]">
                              <span className="font-medium truncate text-base" title={g.name}>{g.name}</span>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Badge variant="outline" className="text-[10px] px-2 h-5">Курси {g.course}</Badge>
                                <Badge variant="secondary" className="text-[10px] px-2 h-5">Басти {g.shift}</Badge>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Semester */}
                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border shrink-0">
                      <button
                        onClick={() => setSemester(1)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${semester === 1 ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                          }`}
                      >Сем 1</button>
                      <button
                        onClick={() => setSemester(2)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${semester === 2 ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                          }`}
                      >Сем 2</button>
                    </div>
                  </div>

                  {selectedGroup && (
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-[10px] px-4 py-2 whitespace-nowrap">
                        <CalendarDays className="w-5 h-5 mr-2" />
                        {selectedGroupName}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] px-4 py-2 border-primary/20 bg-primary/5 text-primary whitespace-nowrap">
                        Курси {groups.find(g => g._id === selectedGroup)?.course || 1}
                      </Badge>
                      <Badge variant={shift === 1 ? "default" : "secondary"} className="whitespace-nowrap">
                        Смена {shift}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Кнопкаҳои амалиёт */}
              {isAdmin && (
                <div className="flex items-center gap-3 shrink-0">
                  {/* Кнопкаи удалит */}
                  {selectedGroup && selectedGroup !== "ALL" && weeklySchedule && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="lg"
                          disabled={deleting}
                          className="shadow-lg"
                        >
                          {deleting ? (
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          ) : (
                            <Trash2 className="w-5 h-5 mr-2" />
                          )}
                          Пок кардан
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Пок кардани ҷадвал?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Шумо мехоҳед ҷадвали <strong>{selectedGroupName}</strong> (Семестри {semester})-ро пурра пок кунед?
                            <br /><br />
                            <span className="text-red-600 font-semibold">
                              ⚠️ Ин амал баргашт надорад! Ҳамаи дарсҳо нест мешаванд.
                            </span>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Бекор</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteSchedule}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Ҳа, пок кардан
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  {/* Кнопкаи таҳрир */}
                  <Button
                    size="lg"
                    onClick={() => setModalOpen(true)}
                    disabled={!selectedGroup}
                    className="shadow-xl"
                  >
                    <Edit3 className="w-5 h-5 mr-3" />
                    Таҳрир кардан
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Содержимое */}
        {!selectedGroup ? (
          <Card className="p-20 text-center border-dashed border-2 bg-gradient-to-b from-slate-50 to-white">
            <div className="bg-white p-5 rounded-full inline-block mb-6 shadow-md border">
              <Users className="w-10 h-10 text-primary/30" />
            </div>
            <h4 className="text-xl font-bold text-slate-600 mb-2">Гурӯҳро интихоб кунед</h4>
            <p className="text-sm text-muted-foreground">Барои дидани ҷадвали ҳафтаина аввал гурӯҳро интихоб кунед</p>
          </Card>
        ) : loading ? (
          <Card className="p-10">
            <div className="space-y-6">
              <div className="h-10 bg-muted rounded-lg animate-pulse" />
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-32 bg-muted/30 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
          </Card>
        ) : selectedGroup === "ALL" ? (
          <div className="space-y-12">
            {Array.isArray(weeklySchedule) &&
              weeklySchedule.map((sched: any) => (
                <div key={sched._id} className="space-y-6">
                  <div className="flex items-center justify-between bg-muted/20 p-6 rounded-2xl border border-primary/20 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-3 rounded-xl">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {sched.groupId?.name || "Гурӯҳи номаълум"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Факултет: {sched.groupId?.faculty || "—"}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-base px-6 py-2">
                      Басти {sched.groupId?.shift || sched.shift || "?"}
                    </Badge>
                  </div>
                  <WeeklyScheduleGrid
                    schedule={sched}
                    shift={sched.groupId?.shift || sched.shift || 1}
                    currentDay={currentDayIndex}
                    currentLesson={currentLesson}
                  />
                </div>
              ))}
          </div>
        ) : (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-gray-800">
                Ҷадвали гурӯҳи <span className="text-primary">{selectedGroupName}</span>
              </h2>
              <p className="text-xl text-muted-foreground mt-3 flex items-center justify-center gap-3">
                <span>Курси {groups.find(g => g._id === selectedGroup)?.course}</span>
                <span>•</span>
                <span>Смена {shift}</span>
                <span>•</span>
                <span>Душанбе – Шанбе</span>
              </p>
            </div>

            <WeeklyScheduleGrid
              schedule={weeklySchedule}
              shift={shift}
              currentDay={currentDayIndex}
              currentLesson={currentLesson}
            />
          </div>
        )}

        <WeeklyScheduleModal
          open={modalOpen}
          setOpen={setModalOpen}
          groupId={selectedGroup}
          groupName={selectedGroupName}
          shift={shift}
          semester={semester}
          subjects={subjects}
          initialSchedule={weeklySchedule}
          onSave={(data: any) => {
            setWeeklySchedule(data);
            fetchSchedule();
          }}
        />
      </div>
    </DashboardLayout>
  );
}
