import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface AttendanceChartProps {
  data: { present: number; absent: number; late: number };
}

export function AttendanceChart({ data }: AttendanceChartProps) {
  const chartData = [
    { name: "Ҳозир", value: data.present, fill: "#10B981" },
    { name: "Нест", value: data.absent, fill: "#EF4444" },
    { name: "Дер", value: data.late, fill: "#F59E0B" },
  ];

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-lg">Attendance Overview (Last 30 days)</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}