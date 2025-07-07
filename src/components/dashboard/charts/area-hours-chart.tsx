"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartTooltipContent, ChartContainer } from "@/components/ui/chart";
import type { Employee } from "@/lib/types";

interface AreaHoursChartProps {
  employees: Employee[];
}

export function AreaHoursChart({ employees }: AreaHoursChartProps) {
  const palette = [
    '#6366F1', // Indigo
    '#F59E42', // Orange
    '#10B981', // Green
    '#F43F5E', // Pink
    '#3B82F6', // Blue
    '#FBBF24', // Yellow
    '#8B5CF6', // Violet
    '#EC4899', // Fuchsia
    '#22D3EE', // Cyan
    '#A3E635', // Lime
  ];

  const chartData = employees.map((emp, idx) => ({
    name: emp.name.split(' ')[0],
    totalHours: emp.totalHours,
    fill: palette[idx % palette.length],
  }));

  return (
    <ChartContainer config={{}} className="h-[250px] w-full">
      <ResponsiveContainer>
        <AreaChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.2}/>
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
          <YAxis />
          <Tooltip cursor={false} content={<ChartTooltipContent />} />
          <Area
            type="monotone"
            dataKey="totalHours"
            stroke="#6366F1"
            fill="url(#area-gradient)"
            strokeWidth={3}
            dot={{ r: 5, stroke: '#fff', strokeWidth: 2, fill: '#6366F1' }}
            activeDot={{ r: 7 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
} 