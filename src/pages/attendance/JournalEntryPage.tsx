// src/pages/attendance/JournalEntryPage.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { ru } from "date-fns/locale";
import {
  ArrowLeft,
  Save,
  Users
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

interface Student {
  studentId: {
    _id: string;
    fullName: string;
  };
  attendance: "present" | "absent" | "late" | null;
  preparationGrade: number | null;
  taskGrade: number | null;
  notes: string;
}
export default function JournalEntryPage() {
  const { date, shift, slot } = useParams<{
    date: string;
    shift: string;
    slot: string;
  }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [journalId, setJournalId] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [subjectName, setSubjectName] = useState("Фан");
  const [groupName, setGroupName] = useState("Гурӯҳ");
  const [groupId, setGroupId] = useState<string>("");

  // Autocomplete search
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;

  // Гирифтани журнал
  const fetchJournal = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${apiUrl}/journal/${date}/${shift}/${slot}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = res.data;
      setJournalId(data._id);
      setSubjectName(data.subjectId?.name || "Фан");
      setGroupName(data.groupId?.name || "Гурӯҳ");
      setGroupId(data.groupId?._id || "");

      setStudents(
        data.students.map((s: any) => ({
          studentId: {
            _id: s.studentId._id,
            fullName:
              s.studentId.fullName ||
              `${s.studentId.firstName || ""} ${
                s.studentId.lastName || ""
              }`.trim(),
          },
          attendance: s.attendance || "absent",
          preparationGrade: s.preparationGrade,
          taskGrade: s.taskGrade,
          notes: s.notes || "",
        }))
      );
    } catch (err: any) {
      console.error("Хатогӣ дар гирифтани журнал:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (date && shift && slot) fetchJournal();
  }, [date, shift, slot]);

  // Ҷустуҷӯи донишҷӯён (debounced)
  const searchStudents = useCallback(
    async (query: string) => {
      if (!query || query.length < 2) {
        setSearchResults([]);
        return;
      }

      setSearchLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${apiUrl}/students/search?query=${encodeURIComponent(query)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Фақат донишҷӯёни бе гурӯҳ ё аз дигар гурӯҳ
        const filtered = res.data.filter(
          (s: any) => !students.find((st) => st?.studentId?._id === s._id)
        );
        setSearchResults(filtered);
      } catch (err) {
        console.error(err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    },
    [students]
  );

  // Илова кардани донишҷӯ ба журнал (гурӯҳ)

  const updateStudent = (id: string, field: keyof Student, value: any) => {
    setStudents((prev) =>
      prev.map((s) => (s?.studentId?._id === id ? { ...s, [field]: value } : s))
    );
  };

  const saveJournal = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${apiUrl}/journal/${journalId}`,
        { students },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Журнал бомуваффақият сабт шуд!");
    } catch (err) {
      alert("Хатогӣ ҳангоми сабт ё шумо устоди ин фан нестед");
    } finally {
      setSaving(false);
    }
  };

  const zonedDate = toZonedTime(new Date(date!), "Asia/Dushanbe");
  const shiftName = shift === "first" || shift === "1" ? "Басти 1" : "Басти 2";
  const time =
    shift === "1" || shift === "first"
      ? `${8 + (Number(slot) - 1)}:00 – ${8 + (Number(slot) - 1)}:50`
      : `${13 + (Number(slot) - 1)}:00 – ${13 + (Number(slot) - 1)}:50`;

  if (loading)
    return (
      <div className="p-8">
        <Skeleton className="h-96 w-full" />
      </div>
    );

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 max-w-7xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Бозгашт
        </Button>

        {/* Header */}
        <Card className="shadow-2xl mb-8 border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
            <CardTitle className="text-3xl font-bold">Журнали дарс</CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 text-lg">
              <div>
                <strong>Гурӯҳ:</strong> {groupName}
              </div>
              <div>
                <strong>Фан:</strong> {subjectName}
              </div>
              <div>
                <strong>Сана:</strong>{" "}
                {format(zonedDate, "dd MMMM yyyy, EEEE", { locale: ru })}
              </div>
            </div>
            ''
            <div className="flex flex-wrap gap-3 mt-4">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {shiftName}
              </Badge>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Соат: {time}
              </Badge>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Слот: {slot}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Тугмаи илова барои admin */}
        {/* {user?.role === "admin" && (
        <div className="mb-8">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-96 justify-between text-lg font-medium">
                <UserPlus className="mr-3 h-5 w-5" />
                {search || "Донишҷӯ ба журнал илова кардан"}
                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="start">
              <Command>
                <CommandInput
                  placeholder="Ном, ID ё email ҷустуҷӯ кунед..."
                  value={search}
                  onValueChange={(value) => {
                    setSearch(value);
                    searchStudents(value);
                  }}
                />
                <CommandEmpty>
                  {searchLoading ? "Ҷустуҷӯ..." : "Ҳеҷ донишҷӯ ёфт нашуд"}
                </CommandEmpty>
                <CommandGroup className="max-h-64 overflow-auto">
                  {searchResults.map((student) => (
                    <CommandItem
                      key={student._id}
                      value={student._id}
                      onSelect={() => addStudentToJournal(student._id)}
                      className="cursor-pointer hover:bg-accent"
                    >
                      <Check className="mr-2 h-4 w-4 opacity-0" />
                      <div>
                        <p className="font-medium">{student.fullName}</p>
                        <p className="text-sm text-muted-foreground">
                          ID: {student._id} • {student.email}
                        </p>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      )} */}

        {/* Жадвал */}
        <Card className="shadow-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Users className="h-7 w-7" />
                Рӯйхати донишҷӯён ({students.length} нафар)
              </CardTitle>
              <Button
                onClick={saveJournal}
                disabled={saving}
                size="lg"
                className="bg-gradient-to-r from-green-600 to-emerald-600"
              >
                {saving ? "Сабт..." : "Сабт кардан"}
                <Save className="ml-3 h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead>Ному насаб</TableHead>
                  <TableHead className="text-center">Ҳозирӣ</TableHead>
                  <TableHead className="text-center">Омодагӣ</TableHead>
                  <TableHead className="text-center">Вазифа</TableHead>
                  <TableHead>Эзоҳ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student, i) => (
                  <TableRow
                    key={student?.studentId?._id}
                    className="hover:bg-muted/50"
                  >
                    <TableCell className="text-center font-medium">
                      {i + 1}
                    </TableCell>
                    <TableCell className="font-semibold text-lg">
                      {student?.studentId?.fullName}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={student.attendance || "absent"}
                        onValueChange={(v) =>
                          updateStudent(
                            student?.studentId?._id,
                            "attendance",
                            v
                          )
                        }
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">Ҳаст</SelectItem>
                          <SelectItem value="absent">Нест</SelectItem>
                          <SelectItem value="late">Дер кард</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max="5"
                        step="1"
                        className="w-24 text-center font-medium"
                        value={student.preparationGrade ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (
                            val === "" ||
                            (Number(val) >= 0 && Number(val) <= 5)
                          ) {
                            updateStudent(
                              student.studentId._id,
                              "preparationGrade",
                              val === "" ? null : Number(val)
                            );
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max="5"
                        step="1"
                        className="w-24 text-center font-medium"
                        value={student.taskGrade ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (
                            val === "" ||
                            (Number(val) >= 0 && Number(val) <= 5)
                          ) {
                            updateStudent(
                              student.studentId._id,
                              "taskGrade",
                              val === "" ? null : Number(val)
                            );
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="Шарҳ..."
                        value={student.notes}
                        onChange={(e) =>
                          updateStudent(
                            student.studentId?._id,
                            "notes",
                            e.target.value
                          )
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
