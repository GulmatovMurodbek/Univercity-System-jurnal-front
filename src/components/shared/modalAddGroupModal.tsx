"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import axios from "axios";

interface ModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  getGroups: () => Promise<void>;
}

export default function ModalAddGroup({ open, setOpen, getGroups }: ModalProps) {
  const [form, setForm] = useState({
    id: "",
    name: "",
    course: "",
    faculty: "",
    subjectCount: "",
    shift: "",
  });

  const apiUrl = import.meta.env.VITE_API_URL;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.id || !form.name || !form.course || !form.faculty || !form.shift) {
      alert("Лутфан ҳамаи майдонҳоро пур кунед!");
      return;
    }

    try {
      await axios.post(`${apiUrl}/groups`, {
        id: form.id,
        name: form.name,
        course: Number(form.course),
        faculty: form.faculty,
        subjectCount: Number(form.subjectCount) || 0,
        shift: Number(form.shift),
      });

      alert("Гурӯҳ бо муваффақият илова шуд!");
      setOpen(false);
      getGroups();

      setForm({
        id: "",
        name: "",
        course: "",
        faculty: "",
        subjectCount: "",
        shift: "",
      });
    } catch (err) {
      console.log(err);
      alert("Ҳангоми илова кардани гурӯҳ хато шуд!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Илова кардани гурӯҳи нав</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">

          {/* Group ID */}
          <div className="grid gap-1">
            <Label htmlFor="id">ID-и гурӯҳ</Label>
            <Input id="id" name="id" value={form.id} onChange={handleChange} />
          </div>

          {/* Group Name */}
          <div className="grid gap-1">
            <Label htmlFor="name">Номи гурӯҳ</Label>
            <Input id="name" name="name" value={form.name} onChange={handleChange} />
          </div>

          {/* Course */}
          <div className="grid gap-1">
            <Label htmlFor="course">Курс</Label>
            <Input
              id="course"
              name="course"
              type="number"
              value={form.course}
              onChange={handleChange}
            />
          </div>

          {/* Faculty */}
          <div className="grid gap-1">
            <Label htmlFor="faculty">Факултет</Label>
            <Input
              id="faculty"
              name="faculty"
              value={form.faculty}
              onChange={handleChange}
            />
          </div>

          {/* Subject Count */}
          <div className="grid gap-1">
            <Label htmlFor="subjectCount">Миқдори фанҳо</Label>
            <Input
              id="subjectCount"
              name="subjectCount"
              type="number"
              value={form.subjectCount}
              onChange={handleChange}
            />
          </div>

          {/* Shift */}
          <div className="grid gap-1">
            <Label>Баст</Label>
            <Select
              value={form.shift}
              onValueChange={(value) => setForm({ ...form, shift: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Интихоби баст" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Басти 1 (08:00 – 13:50)</SelectItem>
                <SelectItem value="2">Басти 2 (13:00 – 18:50)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" onClick={handleSubmit}>
            Захира кардан
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
