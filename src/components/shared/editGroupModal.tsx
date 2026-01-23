import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import axios from "axios";

interface Group {
  id: string;
  name: string;
  course: number;
  faculty: string;
  students: string[];
  subjectCount: number | string;
  _id: string
}

interface EditGroupModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  group: Group;
  getGroups: () => void;
}

export function EditGroupModal({ open, setOpen, group, getGroups }: EditGroupModalProps) {
  const [name, setName] = useState(group.name);
  const [course, setCourse] = useState(group.course);
  const [faculty, setFaculty] = useState(group.faculty);
  const [subjects, setSubjects] = useState(group.subjectCount); // subjects comma separated
  const apiUrl = import.meta.env.VITE_API_URL;
  // Fetch/Update logic
  const [studentsList, setStudentsList] = useState<any[]>([]);

  useEffect(() => {
    setName(group.name);
    setCourse(group.course);
    setFaculty(group.faculty);
    setSubjects(group.subjectCount);

    // Fetch full group details to get students
    if (open && group._id) {
      axios.get(`${apiUrl}/groups/${group._id}`)
        .then(res => setStudentsList(res.data.students || []))
        .catch(err => console.error("Failed to fetch group students", err));
    }
  }, [group, open]);

  const handleEdit = async () => {
    try {
      await axios.put(`${apiUrl}/groups/${group._id}`, {
        ...group,
        name,
        course,
        faculty,
        subjectCount: subjects
      });
      getGroups();
      setOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!confirm("Are you sure you want to remove this student from the group?")) return;
    try {
      await axios.delete(`${apiUrl}/groups/remove-student`, {
        data: { groupId: group._id, studentId }
      });
      // Refresh local list
      setStudentsList(prev => prev.filter(s => s._id !== studentId));
      // Optionally refresh parent
      getGroups();
    } catch (err) {
      console.error("Failed to remove student", err);
      alert("Failed to remove student");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Group & Students</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-1">
              <Label>Course</Label>
              <Input type="number" value={course} onChange={(e) => setCourse(Number(e.target.value))} />
            </div>
          </div>
          <div className="grid gap-1">
            <Label>Faculty</Label>
            <Input value={faculty} onChange={(e) => setFaculty(e.target.value)} />
          </div>
          <div className="grid gap-1">
            <Label>Subjects (comma separated)</Label>
            <Input value={subjects} onChange={(e) => setSubjects(e.target.value)} />
          </div>

          <div className="mt-4 border-t pt-4">
            <Label className="text-lg mb-2 block">Students ({studentsList.length})</Label>
            <div className="space-y-2 max-h-60 overflow-y-auto border p-2 rounded bg-slate-50 dark:bg-slate-900">
              {studentsList.length === 0 ? <p className="text-sm text-muted-foreground p-2">No students in group</p> :
                studentsList.map((student: any) => (
                  <div key={student._id} className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded shadow-sm">
                    <span className="text-sm font-medium">{student.fullName || "No Name"}</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveStudent(student._id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleEdit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
