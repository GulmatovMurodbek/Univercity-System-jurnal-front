// src/pages/admin/AdminNotesPage.tsx
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Calendar, User, BookOpen, School } from "lucide-react";
import axios from "axios";

interface Note {
  date: string; // "dd.MM.yyyy"
  subject: string;
  teacher: string;
  group: string;
  studentName: string;
  notes: string;
}

interface GroupedNotes {
  [group: string]: Note[];
}

export default function AdminNotesPage() {
  const [groups, setGroups] = useState<{ _id: string; name: string; course: number }[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [notes, setNotes] = useState<GroupedNotes>({});
  const [loading, setLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    axios
      .get(`${apiUrl}/groups`)
      .then((res) => setGroups(res.data))
      .catch(console.error);
  }, [apiUrl]);

  const fetchNotes = async () => {
    if (!selectedGroup) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${apiUrl}/journal/admin-notes/${selectedGroup}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(res.data || {});
    } catch (err) {
      console.error("Error fetching notes:", err);
      setNotes({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedGroup) fetchNotes();
  }, [selectedGroup]);

  const allNotes = Object.values(notes).flat();
  const totalNotes = allNotes.length;

  if (!selectedGroup) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center p-6">
          <Card className="w-full max-w-xl p-12 text-center shadow-2xl border-0">
            <MessageSquare className="w-24 h-24 mx-auto mb-8 text-primary" />
            <h1 className="text-3xl font-bold mb-4">Эзоҳҳои донишҷӯён</h1>
            <p className="text-muted-foreground mb-8">Гурӯҳро интихоб кунед</p>
            <Select onValueChange={setSelectedGroup}>
              <SelectTrigger className="w-full text-lg py-6">
                <SelectValue placeholder="Гурӯҳро интихоб кунед..." />
              </SelectTrigger>
              <SelectContent>
                {groups.map((g) => (
                  <SelectItem key={g._id} value={g._id}>
                    {g.name} (Курси {g.course})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <MessageSquare className="w-12 h-12 text-primary" />
            <div>
              <h1 className="text-4xl font-bold">Эзоҳҳои донишҷӯён</h1>
              <p className="text-lg text-muted-foreground mt-2">
                Ҳамаи эзоҳҳои гузошташуда аз муаллимон (танҳо барои админ)
              </p>
            </div>
          </div>

          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {groups.map((g) => (
                <SelectItem key={g._id} value={g._id}>
                  {g.name} (Курси {g.course})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Умумӣ статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="text-5xl font-bold">{totalNotes}</div>
              <p className="text-lg mt-3 opacity-90">Ҷамъи эзоҳҳо</p>
            </CardContent>
          </Card>
          <Card className="shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="text-5xl font-bold text-primary">{Object.keys(notes).length}</div>
              <p className="text-lg text-muted-foreground mt-3">Гурӯҳҳо бо эзоҳ</p>
            </CardContent>
          </Card>
          <Card className="shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="text-5xl font-bold text-amber-600">
                {allNotes.filter((n) => n.notes.toLowerCase().includes("хуб") || n.notes.toLowerCase().includes("аъло")).length}
              </div>
              <p className="text-lg text-muted-foreground mt-3">Эзоҳҳои мусбат (тахминӣ)</p>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="space-y-8">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : totalNotes === 0 ? (
          <Card className="p-20 text-center">
            <MessageSquare className="w-20 h-20 mx-auto mb-6 text-muted-foreground/50" />
            <p className="text-2xl text-muted-foreground">Дар ин гурӯҳ ҳанӯз эзоҳ нест</p>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(notes).map(([groupName, groupNotes]) => (
              <Card key={groupName} className="shadow-2xl overflow-hidden border-0">
                <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <School className="w-8 h-8" />
                    {groupName}
                    <span className="ml-auto text-lg font-normal opacity-90">
                      {groupNotes.length} эзоҳ
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {groupNotes.map((note, idx) => (
                      <div key={idx} className="p-6 hover:bg-muted/30 transition-colors">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              {note.date}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <BookOpen className="w-4 h-4" />
                              {note.subject}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <User className="w-4 h-4" />
                              Муаллим: {note.teacher}
                            </div>
                            <div className="flex items-center gap-2 text-sm font-medium">
                              Донишҷӯ: {note.studentName}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <p className="text-lg font-medium text-foreground leading-relaxed bg-muted/50 p-4 rounded-xl">
                              "{note.notes}"
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}