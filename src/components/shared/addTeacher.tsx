"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import axios from "axios";

interface AddTeacherProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function AddTeacherModal({ open, onClose, onSubmit }: AddTeacherProps) {
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    dateOfBirth: "",
    subjects: [] as string[],
  });

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (open) {
      fetchSubjects();
    }
  }, [open]);

  const fetchSubjects = async () => {
    try {
      const { data } = await axios.get(`${apiUrl}/subjects`);
      setSubjectsList(data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

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
          <DialogTitle>Иловаи устод</DialogTitle>
        </DialogHeader>

        {/* Full Name */}
        <div className="flex flex-col gap-2">
          <Label>Ному насаб</Label>
          <Input name="fullName" value={form.fullName} onChange={handleChange} />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-2">
          <Label>Почтаи электронӣ</Label>
          <Input type="email" name="email" value={form.email} onChange={handleChange} />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <Label>Рамз</Label>
          <Input type="password" name="password" value={form.password} onChange={handleChange} />
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-2">
          <Label>Телефон</Label>
          <Input name="phone" value={form.phone} onChange={handleChange} />
        </div>

        {/* Date of Birth */}
        <div className="flex flex-col gap-2">
          <Label>Санаи таваллуд</Label>
          <Input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} />
        </div>

        {/* Subjects (Multiple) */}
        <div className="flex flex-col gap-2">
          <Label>Фанҳо</Label>
          <Select onValueChange={handleSelectSubject}>
            <SelectTrigger>
              <SelectValue placeholder="Фанҳоро интихоб кунед" />
            </SelectTrigger>
            <SelectContent>
              {subjectsList.map((sub: any) => (
                <SelectItem key={sub._id || sub.name} value={sub.name}>
                  {sub.name}
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
            Сабт кардан
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
