"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface AddTeacherProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}
const subjectsList = [
  "Math",
  "English",
  "Physics",
  "Chemistry",
  "Programming",
  "Frontend",
  "Backend",
];

export default function AddTeacherModal({ open, onClose, onSubmit }: AddTeacherProps) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    dateOfBirth: "",
    subjects: [] as string[],
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectSubject = (value: string) => {
    if (!form.subjects.includes(value)) {
      setForm({ ...form, subjects: [...form.subjects, value] });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Teacher</DialogTitle>
        </DialogHeader>

        {/* Full Name */}
        <div className="flex flex-col gap-2">
          <Label>Full Name</Label>
          <Input name="fullName" value={form.fullName} onChange={handleChange} />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-2">
          <Label>Email</Label>
          <Input type="email" name="email" value={form.email} onChange={handleChange} />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <Label>Password</Label>
          <Input type="password" name="password" value={form.password} onChange={handleChange} />
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-2">
          <Label>Phone</Label>
          <Input name="phone" value={form.phone} onChange={handleChange} />
        </div>

        {/* Date of Birth */}
        <div className="flex flex-col gap-2">
          <Label>Date of Birth</Label>
          <Input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} />
        </div>

        {/* Subjects (Multiple) */}
        <div className="flex flex-col gap-2">
          <Label>Subjects</Label>
          <Select onValueChange={handleSelectSubject}>
            <SelectTrigger>
              <SelectValue placeholder="Select subjects" />
            </SelectTrigger>
            <SelectContent>
              {subjectsList.map((sub) => (
                <SelectItem key={sub} value={sub}>
                  {sub}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/*  Badges  */}
          <div className="flex gap-2 flex-wrap mt-2">
            {form.subjects.map((s) => (
              <Badge key={s} variant="secondary">{s}</Badge>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => onSubmit(form)}
            className="w-full"
          >
            Save Teacher
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
