import { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/PageHeader";

export default function Logs() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${apiUrl}/logs`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLogs(res.data);
        } catch (err) {
            console.error("Error fetching logs:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                <PageHeader
                    title="Амалҳои Система"
                    description="Таърихи амалҳои корбарон дар система (30 рӯзи охир)"
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Фаъолияти охирин</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Сана</TableHead>
                                            <TableHead>Амал</TableHead>
                                            <TableHead>Иҷрокунанда</TableHead>
                                            <TableHead>Рол</TableHead>
                                            <TableHead>Тафсилот</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {logs.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                    Ҳеҷ сабте ёфт нашуд
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            logs.map((log) => (
                                                <TableRow key={log._id}>
                                                    <TableCell className="whitespace-nowrap">
                                                        {format(new Date(log.createdAt), "dd.MM.yyyy HH:mm", { locale: ru })}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{log.action}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {log.performedBy?.name || log.performedBy?.email || "N/A"}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={log.role === 'admin' ? 'destructive' : 'default'}>
                                                            {log.role}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="max-w-md truncate text-xs font-mono text-muted-foreground">
                                                        {JSON.stringify(log.details)}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
