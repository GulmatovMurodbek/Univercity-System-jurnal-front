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

export default function TeacherNotesPage() {
    const [groups, setGroups] = useState<{ _id: string; name: string; course: number }[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<string>("");
    const [notes, setNotes] = useState<GroupedNotes>({});
    const [loading, setLoading] = useState(false);

    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`${apiUrl}/weeklySchedule/my-schedule`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setGroups(res.data.groups || []);
            } catch (err) {
                console.error("Error fetching teacher groups:", err);
            }
        };
        fetchGroups();
    }, [apiUrl]);

    const fetchNotes = async () => {
        if (!selectedGroup) return;
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${apiUrl}/journal/notes/${selectedGroup}`, {
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
                <div className="min-h-screen flex items-center justify-center p-6 bg-[#F3F4F6] dark:bg-slate-900">
                    {/* Added bg color to match dashboard */}
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
                                        {g.name}
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
            <div className="p-6 space-y-8 bg-[#F3F4F6] dark:bg-slate-900 min-h-screen">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-white p-3 rounded-2xl shadow-sm">
                            <MessageSquare className="w-8 h-8 text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">Эзоҳҳои донишҷӯён</h1>
                            <p className="text-slate-500 dark:text-slate-400">
                                Таърихи эзоҳҳо ва қайдҳои рафторӣ
                            </p>
                        </div>
                    </div>

                    <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                        <SelectTrigger className="w-full md:w-64 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {groups.map((g) => (
                                <SelectItem key={g._id} value={g._id}>
                                    {g.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Умумӣ статистика */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg border-none">
                        <CardContent className="p-6 md:p-8 text-center">
                            <div className="text-4xl md:text-5xl font-bold">{totalNotes}</div>
                            <p className="text-base md:text-lg mt-2 opacity-90">Ҷамъи эзоҳҳо</p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm border-none bg-white dark:bg-slate-800">
                        <CardContent className="p-6 md:p-8 text-center">
                            <div className="text-4xl md:text-5xl font-bold text-indigo-600 dark:text-indigo-400">{Object.keys(notes).length}</div>
                            <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 mt-2">Гурӯҳҳо бо эзоҳ</p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm border-none bg-white dark:bg-slate-800">
                        <CardContent className="p-6 md:p-8 text-center">
                            <div className="text-4xl md:text-5xl font-bold text-emerald-600 dark:text-emerald-400">
                                {allNotes.filter((n) => n.notes.toLowerCase().includes("хуб") || n.notes.toLowerCase().includes("аъло")).length}
                            </div>
                            <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 mt-2">Эзоҳҳои мусбат</p>
                        </CardContent>
                    </Card>
                </div>

                {loading ? (
                    <div className="space-y-6">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
                        ))}
                    </div>
                ) : totalNotes === 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center shadow-sm">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                            <MessageSquare className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">Дар ин гурӯҳ ҳанӯз эзоҳ нест</h3>
                        <p className="text-slate-500 mt-2">Барои илова кардани эзоҳ, лутфан аз Журнал истифода баред.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(notes).map(([groupName, groupNotes]) => (
                            <Card key={groupName} className="shadow-md overflow-hidden border-none bg-white dark:bg-slate-800 rounded-2xl">
                                <CardHeader className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700 p-4 md:p-6">
                                    <CardTitle className="flex items-center gap-3 text-lg md:text-xl text-slate-800 dark:text-white">
                                        <School className="w-6 h-6 text-indigo-600" />
                                        {groupName}
                                        <span className="ml-auto text-sm font-normal px-3 py-1 bg-white dark:bg-slate-600 rounded-full text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-500">
                                            {groupNotes.length} эзоҳ
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {groupNotes.map((note, idx) => (
                                            <div key={idx} className="p-4 md:p-6 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                                    {/* Left Info */}
                                                    <div className="lg:col-span-4 space-y-3">
                                                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                                            <Calendar className="w-4 h-4 text-indigo-500" />
                                                            <span className="font-medium">{note.date}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200 font-semibold">
                                                            <User className="w-4 h-4 text-indigo-500" />
                                                            {note.studentName}
                                                        </div>
                                                        <div className="pl-6 text-xs text-slate-500 dark:text-slate-400">
                                                            <span className="block mb-1">Фан: {note.subject}</span>
                                                            <span className="block">Муаллим: {note.teacher}</span>
                                                        </div>
                                                    </div>

                                                    {/* Note Content */}
                                                    <div className="lg:col-span-8">
                                                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 md:p-5 relative group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors border border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-600">
                                                            <MessageSquare className="w-4 h-4 text-indigo-300 absolute top-4 left-4" />
                                                            <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed pl-6 italic">
                                                                "{note.notes}"
                                                            </p>
                                                        </div>
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
