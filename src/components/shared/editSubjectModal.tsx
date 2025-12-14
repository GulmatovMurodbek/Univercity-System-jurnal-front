import * as React from "react";
import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";

interface Teacher {
  _id: string;
  fullName: string;
}

interface Subject {
  _id: string;
  name: string;
  creditHours: number;
  classroom?: string;
  teachers: { teacherId: string; teacherName: string }[];
}

interface EditSubjectModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  subjectToEdit: Subject | null;
  getSubjects: () => void;
  teachers: Teacher[];
}

export function EditSubjectModal({
  open,
  setOpen,
  subjectToEdit,
  getSubjects,
  teachers,
}: EditSubjectModalProps) {
  const [name, setName] = useState("");
  const [creditHours, setCreditHours] = useState(3);
  const [classroom, setClassroom] = useState("");
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (subjectToEdit) {
      setName(subjectToEdit.name);
      setCreditHours(subjectToEdit.creditHours);
      setClassroom(subjectToEdit.classroom || "");
      setSelectedTeachers(subjectToEdit.teachers.map((t) => t.teacherId));
    }
  }, [subjectToEdit]);

  const handleSave = async () => {
    try {
      await axios.put(`${apiUrl}/subjects/${subjectToEdit?._id}`, {
        name,
        creditHours,
        classroom,
        teachers: selectedTeachers.map((id) => {
          const t = teachers.find((t) => t._id === id);
          return { teacherId: id, teacherName: t?.fullName || "" };
        }),
      });
      getSubjects();
      setOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update subject!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle>Edit Subject</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-1">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="grid gap-1">
            <Label>Credit Hours</Label>
            <Input
              type="number"
              min={1}
              max={6}
              value={creditHours}
              onChange={(e) => setCreditHours(Number(e.target.value))}
            />
          </div>

          <div className="grid gap-1">
            <Label>Classroom</Label>
            <Input
              value={classroom}
              onChange={(e) => setClassroom(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label>Teachers</Label>
            <div className="flex flex-wrap gap-2">
              {teachers.map((teacher) => (
                <div key={teacher._id} className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedTeachers.includes(teacher._id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedTeachers([...selectedTeachers, teacher._id]);
                      } else {
                        setSelectedTeachers(
                          selectedTeachers.filter((id) => id !== teacher._id)
                        );
                      }
                    }}
                  />
                  <span>{teacher.fullName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
