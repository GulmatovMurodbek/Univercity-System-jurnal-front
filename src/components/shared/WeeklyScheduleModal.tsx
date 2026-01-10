// src/components/schedule/WeeklyScheduleModal.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface Subject {
  _id: string;
  name: string;
}

interface Teacher {
  _id: string;
  fullName: string;
}

interface Lesson {
  time: string;
  subjectId: string;
  teacherId: string;
  classroom: string;
  lessonType: "lecture" | "practice" | "lab";
  _id?: string;
}

interface DaySchedule {
  day: string;
  lessons: Lesson[];
}

interface WeeklyScheduleModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  groupId: string;
  groupName: string;
  shift: 1 | 2;
  subjects: Subject[];
  initialSchedule: { week: DaySchedule[] } | null;
  onSave: (schedule: any) => void;
}

const timeSlots = (shift: 1 | 2) =>
  shift === 1
    ? [
      "08:00 - 08:50",
      "09:00 - 09:50",
      "10:00 - 10:50",
      "11:00 - 11:50",
      "12:00 - 12:50",
      "13:00 - 13:50",
    ]
    : [
      "13:00 - 13:50",
      "14:00 - 14:50",
      "15:00 - 15:50",
      "16:00 - 16:50",
      "17:00 - 17:50",
      "18:00 - 18:50",
    ];

const weekDaysEn = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const weekDaysTg = ["Дш", "Сш", "Чш", "Пш", "Ҷм", "Шб"];

export function WeeklyScheduleModal({
  open,
  setOpen,
  groupId,
  groupName,
  shift,
  subjects,
  initialSchedule,
  onSave,
}: WeeklyScheduleModalProps) {
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const times = timeSlots(shift);

  useEffect(() => {
    if (open) {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      axios.get(`${import.meta.env.VITE_API_URL}/teachers`, { headers })
        .then((res) => setTeachers(res.data))
        .catch(err => console.error("Error fetching teachers:", err));

      if (initialSchedule?.week) {
        // МУҲИМ: Ислоҳи хатогӣ барои боргузории маълумот
        const mappedWeek = initialSchedule.week.map((day: any) => ({
          day: day.day,
          lessons: day.lessons.map((lesson: any) => ({
            time: lesson.time,
            subjectId: lesson.subjectId?._id || lesson.subjectId || "",
            teacherId: lesson.teacherId?._id || lesson.teacherId || "",
            classroom: lesson.classroom || "",
            lessonType: lesson.lessonType || "lecture",
            _id: lesson._id
          }))
        }));
        setSchedule(mappedWeek);
      } else {
        setSchedule(
          weekDaysEn.map((day) => ({
            day,
            lessons: times.map((time) => ({
              time: time,
              subjectId: "",
              teacherId: "",
              classroom: "",
              lessonType: "lecture",
            })),
          }))
        );
      }
    }
  }, [open, initialSchedule, shift]);

  const updateLesson = (dIdx: number, lIdx: number, field: keyof Lesson, val: string) => {
    setSchedule((prev) => {
      const updated = [...prev];
      if (updated[dIdx]?.lessons[lIdx]) {
        // @ts-ignore
        updated[dIdx].lessons[lIdx][field] = val;
      }
      return updated;
    });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const payload = {
        groupId,
        week: schedule.map((d => ({
          day: d.day,
          lessons: d.lessons.map(l => ({
            time: l.time,
            subjectId: l.subjectId || null,
            teacherId: l.teacherId || null,
            classroom: l.classroom,
            lessonType: l.lessonType,
          })),
        }))),
      }

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/weeklySchedule`, payload, { headers });
      onSave(res.data);
      setOpen(false);
    } catch (err) {
      alert("Хатогӣ ҳангоми сабт!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-7xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Таҳрир — {groupName}</DialogTitle>
        </DialogHeader>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-indigo-100 to-purple-100">
                <th className="p-4 border text-left font-bold">Вақт</th>
                {weekDaysTg.map(d => (
                  <th key={d} className="p-4 border text-center font-bold">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {times.map((time, lIdx) => (
                <tr key={time}>
                  <td className="p-4 border font-bold text-center bg-gray-50">
                    <div className="text-lg">{lIdx + 1}</div>
                    <div className="text-xs text-gray-600">{time}</div>
                  </td>
                  {weekDaysEn.map((_, dIdx) => {
                    const lesson = schedule[dIdx]?.lessons[lIdx] || {
                      subjectId: "",
                      teacherId: "",
                      classroom: "",
                      lessonType: "lecture",
                    };

                    return (
                      <td key={dIdx} className="p-3 border">
                        <div className="space-y-3">
                          {/* Намуди дарс */}
                          <Select
                            value={lesson.lessonType}
                            onValueChange={(v) => updateLesson(dIdx, lIdx, "lessonType", v)}
                          >
                            <SelectTrigger className="h-10 text-xs">
                              <SelectValue>
                                {lesson.lessonType === "lecture" ? "Лексия" :
                                  lesson.lessonType === "practice" ? "Амалӣ" :
                                    lesson.lessonType === "lab" ? "Лабораторӣ" : "Намуд"}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="lecture">Лексия</SelectItem>
                              <SelectItem value="practice">Амалӣ</SelectItem>
                              <SelectItem value="lab">Лабораторӣ</SelectItem>
                            </SelectContent>
                          </Select>

                          {/* Фан */}
                          <Select
                            value={lesson.subjectId}
                            onValueChange={(v) => updateLesson(dIdx, lIdx, "subjectId", v)}
                          >
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Фан" />
                            </SelectTrigger>
                            <SelectContent>
                              {subjects.map(s => (
                                <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select
                            value={lesson.teacherId}
                            onValueChange={(v) => updateLesson(dIdx, lIdx, "teacherId", v)}
                          >
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Муаллим" />
                            </SelectTrigger>
                            <SelectContent>
                              {teachers.map(t => (
                                <SelectItem key={t._id} value={t._id}>
                                  {t.fullName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Input
                            placeholder="Синф"
                            className="h-10"
                            value={lesson.classroom}
                            onChange={(e) => updateLesson(dIdx, lIdx, "classroom", e.target.value)}
                          />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <DialogFooter className="mt-8">
          <Button variant="outline" size="lg" onClick={() => setOpen(false)}>
            Бекор кардан
          </Button>
          <Button size="lg" onClick={handleSave} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            Сабт кардан
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}