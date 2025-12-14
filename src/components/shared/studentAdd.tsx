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
interface Group {
  _id: string;
  name: string;
  id: string;
  course: number;
  faculty: string;
}
interface AddStudentModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  getStudents: () => void; // функсияи навсозии рӯйхат
  groups: Group[]; // рӯйхати гуруҳҳо барои select
}

export function AddStudentModal({
  open,
  setOpen,
  getStudents,
  groups,
}: AddStudentModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [course, setCourse] = useState(1);
  const [group, setGroup] = useState<string>(groups[0]?.id || "");
  const apiUrl = import.meta.env.VITE_API_URL;
  const handleAdd = async () => {
    try {
     let {data}= await axios.post(`${apiUrl}/students`, {
        fullName,
        email,
        password,
        phone,
        dateOfBirth,
        course,
        group,
      });
      getStudents();
      setOpen(false);
      // reset fields
      setFullName("");
      setEmail("");
      setPassword("");
      setPhone("");
      setDateOfBirth("");
      setCourse(1);
      setGroup(groups[0]?._id || "");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className=" w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Student</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-1">
            <Label>Full Name</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="grid gap-1">
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-1">
            <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
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
            <select value={group} onChange={(e) => setGroup(e.target.value)}>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
         
        </div>

        <DialogFooter>
          <Button onClick={handleAdd}>Add Student</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
