// src/components/shared/WeeklyScheduleModal.tsx
// Дизайн: Prod Front + UniJurnal backend
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, ChevronsUpDown, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import axios from "axios";

// ── Интерфейсҳо ───────────────────────────────────────────────────────────────

interface Subject { _id: string; name: string; }
interface Teacher { _id: string; fullName: string; }

interface SlotLesson {
  subjectId: string;
  teacherId: string;
  lessonType: "lecture" | "practice" | "lab";
  classroom: string;
  department: string;
  building: string;
  weekType: "all" | "odd" | "even";
}

const emptyLesson = (): SlotLesson => ({
  subjectId: "", teacherId: "", lessonType: "lecture",
  classroom: "", department: "", building: "", weekType: "all",
});

interface WeeklyScheduleModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  groupId: string;
  groupName: string;
  shift: 1 | 2;
  semester: 1 | 2;
  subjects: Subject[];
  initialSchedule: { week: any[] } | null;
  onSave: (schedule: any) => void;
}

// ── Константаҳо ──────────────────────────────────────────────────────────────

const WEEK_DAYS_EN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WEEK_DAYS_TG = ["Душанбе", "Сешанбе", "Чоршанбе", "Панҷшанбе", "Ҷумъа", "Шанбе"];
const SLOT_COUNT = 3;

const getTimeForSlot = (shift: 1 | 2, slot: number) => {
  const s1: Record<number, string> = { 1: "08:00 – 09:30", 2: "09:40 – 11:10", 3: "11:20 – 12:50" };
  const s2: Record<number, string> = { 1: "13:00 – 14:30", 2: "14:40 – 16:10", 3: "16:20 – 17:50" };
  return (shift === 1 ? s1 : s2)[slot] || "";
};

// ── SearchableSelect ──────────────────────────────────────────────────────────

const SearchableSelect = ({
  value, onChange, options, placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) => {
  const [open, setOpen] = useState(false);
  const label = options.find(o => o.value === value)?.label;

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between h-9 px-3 font-normal text-sm bg-white hover:bg-slate-50 border-slate-200"
        >
          <span className="truncate">{label || <span className="text-muted-foreground">{placeholder}</span>}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-40" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[310px] p-0 z-[200]" align="start" side="bottom">
        <Command>
          <CommandInput placeholder="Ҷустуҷӯ..." className="text-sm" />
          <CommandList>
            <CommandEmpty className="py-5 text-center text-sm text-slate-500">Ёфт нашуд</CommandEmpty>
            <CommandGroup>
              {options.map(o => (
                <CommandItem
                  key={o.value}
                  value={o.label}
                  onSelect={() => { onChange(o.value); setOpen(false); }}
                  className={cn("cursor-pointer", value === o.value && "bg-slate-100")}
                >
                  <Check className={cn("mr-2 h-4 w-4 text-indigo-600", value === o.value ? "opacity-100" : "opacity-0")} />
                  <span className="truncate">{o.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

// ── LessonForm ────────────────────────────────────────────────────────────────

function LessonForm({
  lesson, subjects, teachers, onChange, onClear,
}: {
  lesson?: Partial<SlotLesson>;
  subjects: Subject[];
  teachers: Teacher[];
  onChange: (d: Partial<SlotLesson>) => void;
  onClear: () => void;
}) {
  return (
    <div className="space-y-2.5">
      <SearchableSelect
        value={lesson?.subjectId || ""}
        onChange={v => onChange({ subjectId: v })}
        options={subjects.map(s => ({ value: s._id, label: s.name }))}
        placeholder="Фанро интихоб кунед..."
      />
      <SearchableSelect
        value={lesson?.teacherId || ""}
        onChange={v => onChange({ teacherId: v })}
        options={teachers.map(t => ({ value: t._id, label: t.fullName }))}
        placeholder="Омӯзгор..."
      />

      <div className="grid grid-cols-2 gap-2">
        <Select
          value={lesson?.lessonType || "lecture"}
          onValueChange={(val: any) => onChange({ lessonType: val })}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lecture">Лексия</SelectItem>
            <SelectItem value="practice">Амалӣ</SelectItem>
            <SelectItem value="lab">Лабораторӣ</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Хона (масалан 313)"
          value={lesson?.classroom || ""}
          onChange={e => onChange({ classroom: e.target.value })}
          className="h-8 text-xs"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Input
          placeholder="Бино"
          value={lesson?.building || ""}
          onChange={e => onChange({ building: e.target.value })}
          className="h-8 text-xs"
        />
        <Input
          placeholder="Кафедра"
          value={lesson?.department || ""}
          onChange={e => onChange({ department: e.target.value })}
          className="h-8 text-xs"
        />
      </div>

      {lesson?.subjectId && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="w-full h-7 text-red-500 hover:text-red-600 hover:bg-red-50 text-xs"
        >
          <Trash2 className="w-3 h-3 mr-1" /> Тоза кардан
        </Button>
      )}
    </div>
  );
}

// ── Grid type ─────────────────────────────────────────────────────────────────

type Grid = Record<string, Record<number, { odd?: SlotLesson; even?: SlotLesson; both?: SlotLesson }>>;

// ── Асосӣ ─────────────────────────────────────────────────────────────────────

export function WeeklyScheduleModal({
  open, setOpen, groupId, groupName, shift, semester,
  subjects, initialSchedule, onSave,
}: WeeklyScheduleModalProps) {
  const [activeDay, setActiveDay] = useState("Monday");
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [grid, setGrid] = useState<Grid>({});

  // ── Гирифтани омӯзгорон ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const token = localStorage.getItem("token");
    axios.get(`${import.meta.env.VITE_API_URL}/teachers`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => setTeachers(r.data)).catch(console.error);
  }, [open]);

  // ── Пур кардани grid аз initialSchedule ─────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const init: Grid = {};
    WEEK_DAYS_EN.forEach(d => { init[d] = {}; });

    if (initialSchedule?.week) {
      initialSchedule.week.forEach((dayData: any) => {
        const d = dayData.day;
        if (!init[d]) init[d] = {};
        dayData.lessons.forEach((l: any, idx: number) => {
          const slot = idx + 1;
          if (!init[d][slot]) init[d][slot] = {};
          const lesson: SlotLesson = {
            subjectId: l.subjectId?._id || l.subjectId || "",
            teacherId: l.teacherId?._id || l.teacherId || "",
            lessonType: l.lessonType || "lecture",
            classroom: l.classroom || "",
            department: l.department || "",
            building: l.building || "",
            weekType: l.weekType || "all",
          };
          if (lesson.weekType === "odd") init[d][slot].odd = lesson;
          else if (lesson.weekType === "even") init[d][slot].even = lesson;
          else init[d][slot].both = lesson;
        });
      });
    }
    setGrid(init);
  }, [open, initialSchedule]);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const getSlot = (day: string, slot: number, type: "odd" | "even" | "both") =>
    grid[day]?.[slot]?.[type];

  const isSplitMode = (day: string, slot: number) => {
    const s = grid[day]?.[slot];
    return !!(s?.odd || s?.even) && !s?.both;
  };

  const setSlotLesson = (day: string, slot: number, type: "odd" | "even" | "both", data: Partial<SlotLesson>) => {
    setGrid(prev => {
      const g = { ...prev };
      if (!g[day]) g[day] = {};
      if (!g[day][slot]) g[day][slot] = {};
      g[day][slot] = {
        ...g[day][slot],
        [type]: {
          ...(g[day][slot][type] || emptyLesson()),
          ...data,
          weekType: type === "both" ? "all" : type,
        },
      };
      return g;
    });
  };

  const clearSlot = (day: string, slot: number, type: "odd" | "even" | "both") => {
    setGrid(prev => {
      const g = { ...prev };
      if (g[day]?.[slot]) {
        g[day] = { ...g[day], [slot]: { ...g[day][slot], [type]: undefined } };
      }
      return g;
    });
  };

  const switchMode = (day: string, slot: number, toSplit: boolean) => {
    setGrid(prev => {
      const g = { ...prev };
      g[day] = {
        ...g[day],
        [slot]: toSplit
          ? { odd: emptyLesson(), even: emptyLesson() }
          : { both: emptyLesson() },
      };
      return g;
    });
  };

  // ── Сабт ─────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setLoading(true);
    try {
      const week = WEEK_DAYS_EN.map(day => {
        const daySlots = grid[day] || {};
        const lessons: (SlotLesson & { time: string })[] = [];
        for (let s = 1; s <= SLOT_COUNT; s++) {
          const slot = daySlots[s];
          const time = getTimeForSlot(shift, s);
          if (!slot) {
            lessons.push({ ...emptyLesson(), weekType: "all", time });
            continue;
          }
          if (slot.both && (slot.both.subjectId || slot.both.teacherId)) {
            lessons.push({ ...slot.both, weekType: "all", time });
          } else if (slot.odd || slot.even) {
            lessons.push(slot.odd ? { ...slot.odd, weekType: "odd", time } : { ...emptyLesson(), weekType: "odd", time });
            lessons.push(slot.even ? { ...slot.even, weekType: "even", time } : { ...emptyLesson(), weekType: "even", time });
          } else {
            lessons.push({ ...emptyLesson(), weekType: "all", time });
          }
        }
        return { day, lessons };
      });

      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/weeklySchedule`,
        { groupId, semester, week },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSave(res.data);
      setOpen(false);
    } catch {
      alert("Хатогӣ ҳангоми сабт!");
    } finally {
      setLoading(false);
    }
  };

  // ── UI ────────────────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[95vw] w-full h-[95vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-white shrink-0">
          <DialogTitle className="text-xl font-bold">
            Таҳрири ҷадвал —{" "}
            <span className="text-primary">{groupName}</span>
            <span className="ml-3 text-sm font-normal text-muted-foreground">
              Баст {shift} • Сем {semester}
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar — рӯзҳо */}
          <div className="w-44 shrink-0 border-r bg-slate-50 flex flex-col py-2 overflow-y-auto">
            {WEEK_DAYS_EN.map((dayEn, i) => (
              <button
                key={dayEn}
                onClick={() => setActiveDay(dayEn)}
                className={cn(
                  "px-4 py-3.5 text-sm font-medium text-left transition-all border-r-2",
                  activeDay === dayEn
                    ? "bg-indigo-50 text-indigo-700 border-indigo-500"
                    : "border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                {WEEK_DAYS_TG[i]}
              </button>
            ))}
          </div>

          {/* Слотҳо */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-100/50">
            {Array.from({ length: SLOT_COUNT }, (_, i) => i + 1).map(pairNum => {
              const split = isSplitMode(activeDay, pairNum);
              const both = getSlot(activeDay, pairNum, "both");
              const odd = getSlot(activeDay, pairNum, "odd");
              const even = getSlot(activeDay, pairNum, "even");

              return (
                <div key={pairNum} className="bg-white rounded-xl shadow-sm border p-5">
                  {/* Slot header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                      {pairNum}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-700 text-sm">Ҷуфти {pairNum}</h4>
                      <span className="text-xs text-muted-foreground">{getTimeForSlot(shift, pairNum)}</span>
                    </div>
                  </div>

                  {/* Tabs */}
                  <Tabs
                    value={split ? "split" : "both"}
                    onValueChange={(val) => switchMode(activeDay, pairNum, val === "split")}
                  >
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="both">Ҳар ҳафта (Як хел)</TabsTrigger>
                      <TabsTrigger value="split">Тоқ / Ҷуфт (Ҷудогона)</TabsTrigger>
                    </TabsList>

                    <TabsContent value="both" className="mt-0">
                      <LessonForm
                        lesson={both}
                        subjects={subjects}
                        teachers={teachers}
                        onChange={(data) => setSlotLesson(activeDay, pairNum, "both", data)}
                        onClear={() => clearSlot(activeDay, pairNum, "both")}
                      />
                    </TabsContent>

                    <TabsContent value="split" className="mt-0">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 border rounded-lg p-3 bg-blue-50/40">
                          <div className="text-xs font-bold text-blue-700 uppercase mb-3">Ҳафтаи Тоқ</div>
                          <LessonForm
                            lesson={odd}
                            subjects={subjects}
                            teachers={teachers}
                            onChange={(data) => setSlotLesson(activeDay, pairNum, "odd", data)}
                            onClear={() => clearSlot(activeDay, pairNum, "odd")}
                          />
                        </div>
                        <div className="flex-1 border rounded-lg p-3 bg-purple-50/40">
                          <div className="text-xs font-bold text-purple-700 uppercase mb-3">Ҳафтаи Ҷуфт</div>
                          <LessonForm
                            lesson={even}
                            subjects={subjects}
                            teachers={teachers}
                            onChange={(data) => setSlotLesson(activeDay, pairNum, "even", data)}
                            onClear={() => clearSlot(activeDay, pairNum, "even")}
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t bg-white shrink-0">
          <Button variant="outline" onClick={() => setOpen(false)}>Бекор кардан</Button>
          <Button onClick={handleSave} disabled={loading} className="min-w-[120px]">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Сабт кардан
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
