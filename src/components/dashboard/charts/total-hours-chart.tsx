"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts"
import { ChartTooltipContent, ChartContainer } from "@/components/ui/chart"
import type { Employee } from "@/lib/types"

interface TotalHoursChartProps {
  employees: Employee[];
}

export function TotalHoursChart({ employees }: TotalHoursChartProps) {
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

  const chartConfig = {
    totalHours: {
      label: "Total Hours",
      color: "hsl(var(--primary))",
    },
  }

  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <ResponsiveContainer>
        <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="name"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            
          />
          <YAxis />
          <Tooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar
            dataKey="totalHours"
            radius={[8, 8, 0, 0]}
            isAnimationActive={true}
            // Use fill from data
            {
              ...{
                data: chartData,
                fill: undefined,
              }
            }
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
