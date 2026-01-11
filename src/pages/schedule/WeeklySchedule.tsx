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
}
type User = {
  role: "admin" | "teacher" | "student";
};
export default function WeeklySchedulePage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [selectedGroupName, setSelectedGroupName] = useState<string>("");
  const [shift, setShift] = useState<1 | 2>(1); // ← ДУРУСТ: useState!
  const [weeklySchedule, setWeeklySchedule] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const user: User | null = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") as string)
    : null;
  const apiUrl = import.meta.env.VITE_API_URL;

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
      .get(`${apiUrl}/weeklySchedule/group/${selectedGroup}`)
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
  }, [selectedGroup, groups]); // ← Ҳар дафъа groupId ё groups тағйир ёбад

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
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-6 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full sm:w-auto">
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-primary" />
                  <Select value={selectedGroup} onValueChange={handleGroupChange}>
                    <SelectTrigger className="w-full sm:w-80 text-lg">
                      <SelectValue placeholder="Гурӯҳро интихоб кунед" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">
                        <div className="flex items-center gap-3 font-bold text-primary">
                          <Users className="w-5 h-5" />
                          Ҳамаи гурӯҳҳо
                        </div>
                      </SelectItem>
                      {groups.map((g) => (
                        <SelectItem key={g._id} value={g._id}>
                          <div className="flex items-center justify-between w-full text-[14px]">
                            <span >{g.name.slice(0, 25)}...</span>
                            <Badge variant="outline" className="ml-4">
                              Басти {g.shift}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedGroup && (
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-[10px] px-4 py-2">
                      <CalendarDays className="w-5 h-5 mr-2" />
                      {selectedGroupName}
                    </Badge>
                    <Badge variant={shift === 1 ? "default" : "secondary"}>
                      Смена {shift}
                    </Badge>
                  </div>
                )}
              </div>
              {user?.role == "admin" ?
                (
                  <Button
                    size="lg"
                    onClick={() => setModalOpen(true)}
                    disabled={!selectedGroup}
                    className="shadow-xl"
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
              <p className="text-xl text-muted-foreground mt-3">
                Смена {shift} • Душанбе – Шанбе
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
          subjects={subjects}
          initialSchedule={weeklySchedule}
          onSave={setWeeklySchedule}
        />
      </div>
    </DashboardLayout>
  );
}
