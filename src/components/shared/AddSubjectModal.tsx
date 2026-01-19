import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import axios from "axios";

interface Teacher {
  _id: string;
  fullName: string;
  email: string;
}

interface Group {
  _id: string;
  name: string;
}

interface AddSubjectModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  getSubjects: () => void;
  teachers: Teacher[];
}

export function AddSubjectModal({
  open,
  setOpen,
  getSubjects,
  teachers,
}: AddSubjectModalProps) {
  const [name, setName] = useState("");
  const [creditHours, setCreditHours] = useState(3);
  const [selectedTeachers, setSelectedTeachers] = useState<Teacher[]>([]);
  const [classroom, setClassroom] = useState("");

  const apiUrl = import.meta.env.VITE_API_URL;

  const handleAdd = async () => {
    try {
      const teachersPayload = selectedTeachers.map((t) => ({
        teacherId: t._id,
        teacherName: t.fullName,
      }));

      await axios.post(`${apiUrl}/subjects`, {
        name,
        creditHours,
        teachers: teachersPayload,
        classroom,
      });

      getSubjects();
      setOpen(false);

      // reset fields
      setName("");
      setCreditHours(3);
      setSelectedTeachers([]);
      setClassroom("");
    } catch (err) {
      console.error(err);
      alert("Failed to add subject!");
    }
  };

  const toggleTeacher = (teacher: Teacher) => {
    if (selectedTeachers.some((t) => t._id === teacher._id)) {
      setSelectedTeachers(selectedTeachers.filter((t) => t._id !== teacher._id));
    } else {
      setSelectedTeachers([...selectedTeachers, teacher]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Иловаи фан</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Subject Name */}
          <div className="grid gap-1">
            <Label>Номи фан</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          {/* Credit Hours */}
          <div className="grid gap-1">
            <Label>Соатҳои кредитӣ</Label>
            <Input
              type="number"
              min={1}
              max={10}
              value={creditHours}
              onChange={(e) => setCreditHours(Number(e.target.value))}
            />
          </div>

          {/* Teachers Multi-Select */}
          <div className="grid gap-1">
            <Label>Устодон</Label>
            <div className="border rounded p-2 max-h-40 overflow-y-auto">
              {teachers.map((teacher) => (
                <div key={teacher._id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedTeachers.some((t) => t._id === teacher._id)}
                    onChange={() => toggleTeacher(teacher)}
                  />
                  <span>{teacher.fullName}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Classroom */}
          <div className="grid gap-1">
            <Label>Синфхона</Label>
            <Input
              value={classroom}
              onChange={(e) => setClassroom(e.target.value)}
            />
          </div>

          {/* Group Select */}
        </div>

        <DialogFooter>
          <Button onClick={handleAdd}>Илова кардан</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
