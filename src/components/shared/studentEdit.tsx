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
import axios from "axios";
import { useEffect, useState } from "react";

interface Group {
  _id: string;
  name: string;
  id: string;
  course: number;
  faculty: string;
}

interface EditStudentModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  student: any | null;
  getStudents: () => void;
  groups: Group[];
}

export function EditStudentModal({
  open,
  setOpen,
  student,
  getStudents,
  groups,
}: EditStudentModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [course, setCourse] = useState(1);
  const [group, setGroup] = useState<string>("");
  const [paidAmount, setPaidAmount] = useState<number>(0); // NEW

  const apiUrl = import.meta.env.VITE_API_URL;

  // 📌 Set values when modal is opened
  useEffect(() => {
    if (student) {
      setFullName(student.fullName);
      setEmail(student.email);
      setPhone(student.phone || "");
      setDateOfBirth(student.dateOfBirth?.slice(0, 10) || "");
      setCourse(student.course);
      setGroup(student.group);
      setPaidAmount(student.paidAmount || 0); // NEW
    }
  }, [student]);

  const handleUpdate = async () => {
    try {
      await axios.put(`${apiUrl}/students/${student._id}`, {
        fullName,
        email,
        phone,
        dateOfBirth,
        course,
        group,
        paidAmount,          // NEW FIELD → send to backend
      });

      getStudents();
      setOpen(false);
    } catch (err) {
      console.error(err);
      alert("Update failed!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">

          <div className="grid gap-1">
            <Label>Full Name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>

          <div className="grid gap-1">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="grid gap-1">
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <div className="grid gap-1">
            <Label>Date of Birth</Label>
            <Input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </div>

          <div className="grid gap-1">
            <Label>Course</Label>
            <Input
              type="number"
              min={1}
              max={4}
              value={course}
              onChange={(e) => setCourse(Number(e.target.value))}
            />
          </div>

          <div className="grid gap-1">
            <Label>Group</Label>
            <select
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              className="border rounded px-2 py-1"
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* ---- NEW INPUT ---- */}
          <div className="grid gap-1">
            <Label>Paid Amount (Somoni)</Label>
            <Input
              type="number"
              min={0}
              value={paidAmount}
              onChange={(e) => setPaidAmount(Number(e.target.value))}
            />
          </div>

        </div>

        <DialogFooter>
          <Button onClick={handleUpdate}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
