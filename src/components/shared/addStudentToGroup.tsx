// src/components/modals/AddStudentsToGroupModal.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Users, CheckCircle2 } from "lucide-react";
import axios from "axios";

interface Student {
  _id: string;
  fullName: string;
  email: string;
}

interface AddStudentsModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  groupId: string;
  groupName: string;
  onSuccess?: () => void;
}

export function AddStudentsToGroupModal({
  open,
  setOpen,
  groupId,
  groupName,
  onSuccess,
}: AddStudentsModalProps) {
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;

  // 🔥 1. API – танҳо як бор ҳангоми кушодани модал
  // 🔥 1. API – Fetch students with search query
  const fetchStudents = async (query: string = "") => {
    try {
      setLoading(true); // Optional: show loading state on list if needed, but we have a global loading state for add action.
      // Can add a separate loading state for search if desired.
      const token = localStorage.getItem("token");
      // Use the newly implemented limit and search params
      const res = await axios.get(`${apiUrl}/students?search=${query}&limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data.students || res.data || []);
    } catch (err) {
      console.error("Хатогӣ ҳангоми овардани студентҳо:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 2. Debounced Search Effect
  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      fetchStudents(search);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [search, open]);

  // Use students directly instead of filteredStudents
  const filteredStudents = students;

  // 🔥 3. Интихоби студент
  const toggleStudent = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // 🔥 4. Илова кардан
  const addSelected = async () => {
    if (selected.length === 0)
      return alert("Донишҷӯёнро интихоб кунед");

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${apiUrl}/groups/add-student`,
        { groupId, studentId: selected },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`${selected.length} донишҷӯ илова шуд!`);
      onSuccess?.();
      setOpen(false);

      // Reset
      setSearch("");
      setSelected([]);
      setStudents([]);
    } catch (err: any) {
      alert("Хатогӣ: " + (err.response?.data?.message || "Натавонист илова кунад"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            <Users className="w-7 h-7" />
            Донишҷӯёнро ба гурӯҳи "{groupName}" илова кунед
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Search */}
          <div className="flex gap-3">
            <Input
              placeholder="Ном, email ё ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <Button disabled>
              <Search className="w-5 h-5" />
            </Button>
          </div>

          {/* List */}
          {filteredStudents.length > 0 ? (
            <div className="space-y-3 border rounded-xl p-4 bg-muted/30">
              <p className="text-sm text-muted-foreground mb-3">
                {filteredStudents.length} донишҷӯ ёфт шуд:
              </p>

              {filteredStudents.map((student) => (
                <div
                  key={student._id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition cursor-pointer"
                  onClick={() => toggleStudent(student._id)}
                >
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={selected.includes(student._id)}
                      onCheckedChange={() => toggleStudent(student._id)}
                    />
                    <div>
                      <p className="font-semibold">{student.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        ID: {student._id} • {student.email}
                      </p>
                    </div>
                  </div>

                  {selected.includes(student._id) && (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Натиҷа ёфт нашуд
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Бекор кардан
          </Button>
          <Button
            onClick={addSelected}
            disabled={loading || selected.length === 0}
            className="min-w-40"
          >
            {loading ? "Илова шуда истода..." : `Илова кардан (${selected.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
