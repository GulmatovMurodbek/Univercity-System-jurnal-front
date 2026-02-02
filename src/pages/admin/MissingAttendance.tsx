import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import axios from "axios";
import { Calendar as CalendarIcon, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface MissingEntry {
    group: string;
    teacher: string;
    subject: string;
    time: string;
    slot: number;
    shift: number;
}

export default function MissingAttendance() {
    const [date, setDate] = useState<Date>(new Date());
    const [data, setData] = useState<MissingEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const apiUrl = import.meta.env.VITE_API_URL;

    const fetchData = async () => {
        setLoading(true);
        setError("");
        try {
            const token = localStorage.getItem("token");
            const formattedDate = format(date, "yyyy-MM-dd");
            const res = await axios.get(`${apiUrl}/journal/missing?date=${formattedDate}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setData(res.data.missing);
        } catch (err: any) {
            console.error(err);
            setError("Хатогӣ ҳангоми боргирии маълумот");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [date]);

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-background p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Журналҳои пуршуданашуда</h1>
                            <p className="text-muted-foreground mt-1">
                                Рӯйхати дарсҳое, ки муаллимон дар журнал қайд накардаанд
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-[240px] justify-start text-left font-normal",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP", { locale: ru }) : <span>Санаро интихоб кунед</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={(d) => d && setDate(d)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>

                            <Button variant="outline" size="icon" onClick={fetchData} disabled={loading}>
                                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                            </Button>
                        </div>
                    </div>

                    <Card className="border-0 shadow-md">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Натиҷаҳо барои {format(date, "d MMMM yyyy", { locale: ru })}</CardTitle>
                                    <CardDescription>
                                        {loading
                                            ? "Дар ҳоли санҷиш..."
                                            : data.length === 0
                                                ? "Ҳамаи дарсҳо қайд шудаанд"
                                                : `${data.length} дарс бе журнал ёфт шуд`}
                                    </CardDescription>
                                </div>
                                {!loading && data.length > 0 && (
                                    <Badge variant="destructive" className="px-3 py-1 text-sm">
                                        {data.length} камбудӣ
                                    </Badge>
                                )}
                                {!loading && data.length === 0 && (
                                    <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 px-3 py-1 text-sm">
                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                        Аъло
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex items-center justify-between py-4 border-b">
                                            <div className="space-y-2">
                                                <Skeleton className="h-5 w-48" />
                                                <Skeleton className="h-4 w-32" />
                                            </div>
                                            <Skeleton className="h-8 w-24" />
                                        </div>
                                    ))}
                                </div>
                            ) : error ? (
                                <div className="flex items-center justify-center py-12 text-destructive gap-2">
                                    <AlertCircle className="h-5 w-5" />
                                    <span>{error}</span>
                                </div>
                            ) : data.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                    <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center mb-4">
                                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                    </div>
                                    <h3 className="text-lg font-medium text-foreground">Ҳамааш хуб аст!</h3>
                                    <p>Дар ин сана ягон дарси бе журнал ёфт нашуд.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Mobile View */}
                                    <div className="md:hidden space-y-4">
                                        {data.map((item, index) => (
                                            <Card key={index} className="shadow-sm border">
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-base font-bold text-indigo-700 dark:text-indigo-400">
                                                        {item.subject}
                                                    </CardTitle>
                                                    <CardDescription className="font-medium text-foreground">
                                                        {item.teacher}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="space-y-2 text-sm pb-4">
                                                    <div className="flex justify-between items-center bg-muted/50 p-2 rounded-md">
                                                        <span className="text-muted-foreground">Гурӯҳ:</span>
                                                        <Badge variant="outline" className="bg-background">{item.group}</Badge>
                                                    </div>
                                                    <div className="flex justify-between items-center p-2">
                                                        <span className="text-muted-foreground">Вақт:</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold">{item.time}</span>
                                                            <span className="text-xs text-muted-foreground">(Пара: {item.slot})</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between items-center p-2 border-t">
                                                        <span className="text-muted-foreground">Баст:</span>
                                                        <Badge variant="secondary">{item.shift}</Badge>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>

                                    {/* Desktop View */}
                                    <div className="hidden md:block rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Муаллим</TableHead>
                                                    <TableHead>Фан</TableHead>
                                                    <TableHead>Гурӯҳ</TableHead>
                                                    <TableHead>Вақт</TableHead>
                                                    <TableHead className="text-right">Баст (Shift)</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {data.map((item, index) => (
                                                    <TableRow key={index} className="hover:bg-muted/50">
                                                        <TableCell className="font-medium">
                                                            <div className="flex flex-col">
                                                                <span>{item.teacher}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{item.subject}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">{item.group}</Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium">{item.time}</span>
                                                                <span className="text-xs text-muted-foreground">(Пара: {item.slot})</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {item.shift}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
