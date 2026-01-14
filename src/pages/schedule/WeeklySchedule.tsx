// src/pages/schedule/WeeklySchedulePage.tsx — НИҲОӢ ВА БЕ ХАТОГӢ
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
import { Edit3, Users, CalendarDays } from "lucide-react";
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
  role: "admin" | "teacher" | "student";
};
export default function WeeklySchedulePage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [selectedGroupName, setSelectedGroupName] = useState<string>("");
  const [shift, setShift] = useState<1 | 2>(1); // ← ДУРУСТ: useState!
  const [semester, setSemester] = useState<1 | 2>(1); // Default to 1, or dynamic based on date
  const [weeklySchedule, setWeeklySchedule] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const user: User | null = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") as string)
    : null;
  const apiUrl = import.meta.env.VITE_API_URL;

  // Set initial semester based on date
  useEffect(() => {
    const month = new Date().getMonth(); // 0 = Jan, 1 = Feb, ...
    if (month >= 1 && month <= 5) {
      setSemester(2);
    } else {
      setSemester(1);
    }
  }, []);

  // Гирифтани гурӯҳҳо ва фанҳо
  useEffect(() => {
    Promise.all([
      axios.get(`${apiUrl}/groups`),
      axios.get(`${apiUrl}/subjects`),
    ])
      .then(([groupsRes, subjectsRes]) => {
        setGroups(groupsRes.data);
        setSubjects(subjectsRes.data);
      })
      .catch(console.error);
  }, [apiUrl]);

  // Ҳар дафъа selectedGroup тағйир ёбад — ҳама чизро аз нав кунем!
  useEffect(() => {
    if (!selectedGroup) {
      setWeeklySchedule(null);
      setSelectedGroupName("");
      setShift(1);
      return;
    }

    if (selectedGroup === "ALL") {
      setSelectedGroupName("Ҳамаи гурӯҳҳо");
      // setLoading and fetching is handled below
    } else {
      const group = groups.find((g) => g._id === selectedGroup);
      if (group) {
        setSelectedGroupName(group.name);
        setShift(group.shift === 2 ? 2 : 1);
      }
    }

    setLoading(true);
    setWeeklySchedule(null);

    axios
      .get(`${apiUrl}/weeklySchedule/group/${selectedGroup}`, {
        params: { semester }
      })
      .then((res) => {
        setWeeklySchedule(res.data);
      })
      .catch((err) => {
        console.error(err);
        setWeeklySchedule(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedGroup, groups, semester]); // ← Ҳар дафъа groupId ё groups ё semester тағйир ёбад

  const handleGroupChange = (groupId: string) => {
    setSelectedGroup(groupId);
  };

  // Рӯзи ҷорӣ ва дарси ҷорӣ
  const today = new Date().getDay();
  const currentDayIndex = today === 0 ? 5 : today - 1;
  const hour = new Date().getHours();
  const currentLesson =
    shift === 1
      ? hour >= 13
        ? 6
        : hour >= 12
          ? 5
          : hour >= 11
            ? 4
            : hour >= 10
              ? 3
              : hour >= 9
                ? 2
                : 1
      : hour >= 18
        ? 6
        : hour >= 17
          ? 5
          : hour >= 16
            ? 4
            : hour >= 15
              ? 3
              : hour >= 14
                ? 2
                : 1;

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

              {/* Scrollable Filters Section */}
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
                              <span className="font-medium truncate text-base" title={g.name}>
                                {g.name}
                              </span>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Badge variant="outline" className="text-[10px] px-2 h-5">
                                  Курси {g.course}
                                </Badge>
                                <Badge variant="secondary" className="text-[10px] px-2 h-5">
                                  Басти {g.shift}
                                </Badge>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Semester Selector */}
                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border shrink-0">
                      <button
                        onClick={() => setSemester(1)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${semester === 1
                          ? "bg-white text-primary shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                          }`}
                      >
                        Сем 1
                      </button>
                      <button
                        onClick={() => setSemester(2)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${semester === 2
                          ? "bg-white text-primary shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                          }`}
                      >
                        Сем 2
                      </button>
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

              {user?.role == "admin" ?
                (
                  <Button
                    size="lg"
                    onClick={() => setModalOpen(true)}
                    disabled={!selectedGroup}
                    className="shadow-xl shrink-0 w-full xl:w-auto mt-2 xl:mt-0"
                  >
                    <Edit3 className="w-5 h-5 mr-3" />
                    Таҳрир кардан
                  </Button>
                ) : null}
            </div>
          </CardContent>
        </Card>

        {/* Агар гурӯҳ интихоб нашуда бошад */}
        {!selectedGroup ? (
          <Card className="border-dashed border-2 border-muted-foreground/20">
            <CardContent className="flex flex-col items-center justify-center py-32 text-center">
              <div className="bg-muted/30 rounded-full p-12 mb-8">
                <CalendarDays className="w-24 h-24 text-muted-foreground/50" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Гурӯҳ интихоб кунед</h3>
              <p className="text-muted-foreground text-lg max-w-md">
                Барои дидан ва таҳрир кардани ҷадвали ҳафтаина, лутфан гурӯҳро аз боло интихоб кунед.
              </p>
            </CardContent>
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
          <div className="space-y-12 animate-in fade-in zoom-in-95 duration-700">
            {Array.isArray(weeklySchedule) && weeklySchedule.map((sched: any) => (
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
          <div className="animate-in fade-in zoom-in-95 duration-700">
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
          semester={semester} // <-- Pass semester
          subjects={subjects}
          initialSchedule={weeklySchedule}
          onSave={setWeeklySchedule}
        />
      </div>
    </DashboardLayout>
  );
}
