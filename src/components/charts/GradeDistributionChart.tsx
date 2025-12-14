import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const data = [
  { name: 'Excellent', value: 35, color: 'hsl(var(--grade-excellent))' },
  { name: 'Good', value: 40, color: 'hsl(var(--grade-good))' },
  { name: 'Satisfactory', value: 18, color: 'hsl(var(--grade-satisfactory))' },
  { name: 'Poor', value: 7, color: 'hsl(var(--grade-poor))' },
];

export function GradeDistributionChart() {
  return (
    <Card variant="default">
      <CardHeader>
        <CardTitle className="text-lg">Grade Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-lg)',
                }}
                formatter={(value: number) => [`${value}%`, 'Students']}
              />
              <Legend
                iconType="circle"
                iconSize={10}
                formatter={(value) => (
                  <span className="text-sm text-muted-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
