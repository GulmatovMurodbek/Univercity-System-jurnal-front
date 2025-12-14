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
  _id:string
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
  useEffect(() => {
    setName(group.name);
    setCourse(group.course);
    setFaculty(group.faculty);
    setSubjects(group.subjectCount);
  }, [group]);

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Group</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-1">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-1">
            <Label>Course</Label>
            <Input type="number" value={course} onChange={(e) => setCourse(Number(e.target.value))} />
          </div>
          <div className="grid gap-1">
            <Label>Faculty</Label>
            <Input value={faculty} onChange={(e) => setFaculty(e.target.value)} />
          </div>
          <div className="grid gap-1">
            <Label>Subjects (comma separated)</Label>
            <Input value={subjects} onChange={(e) => setSubjects(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleEdit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
