"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface Teacher {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
    subjects: string[];
    dateOfBirth?: string;
}

interface EditTeacherProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (id: string, data: any) => Promise<void>;
    teacher: Teacher | null;
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

export default function EditTeacherModal({ open, onClose, onSubmit, teacher }: EditTeacherProps) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        fullName: "",
        email: "",
        password: "", // Optional: only send if changed
        phone: "",
        dateOfBirth: "",
        subjects: [] as string[],
    });

    useEffect(() => {
        if (teacher) {
            setForm({
                fullName: teacher.fullName || "",
                email: teacher.email || "",
                password: "", // Reset password field
                phone: teacher.phone || "",
                dateOfBirth: teacher.dateOfBirth ? new Date(teacher.dateOfBirth).toISOString().split('T')[0] : "",
                subjects: teacher.subjects || [],
            });
        }
    }, [teacher]);

    const handleChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSelectSubject = (value: string) => {
        if (!form.subjects.includes(value)) {
            setForm({ ...form, subjects: [...form.subjects, value] });
        }
    };

    const removeSubject = (subjectToRemove: string) => {
        setForm({
            ...form,
            subjects: form.subjects.filter((s) => s !== subjectToRemove),
        });
    };

    const handleSubmit = async () => {
        if (!teacher) return;
        setLoading(true);
        try {
            // Filter out empty password if not changing
            const dataToSend: any = { ...form };
            if (!dataToSend.password) {
                delete dataToSend.password;
            }
            await onSubmit(teacher._id, dataToSend);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Таҳрири устод</DialogTitle>
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
                    <Label>Рамз (агар иваз накунед, холи монед)</Label>
                    <Input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Рамзи навро ворид кунед"
                    />
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
                            <Badge
                                key={s}
                                variant="secondary"
                                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() => removeSubject(s)}
                            >
                                {s} &times;
                            </Badge>
                        ))}
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        onClick={handleSubmit}
                        className="w-full"
                        disabled={loading}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
