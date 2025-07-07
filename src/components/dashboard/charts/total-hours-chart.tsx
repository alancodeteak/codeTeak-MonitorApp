"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { ChartTooltipContent, ChartContainer } from "@/components/ui/chart"
import type { Employee } from "@/lib/types"

interface TotalHoursChartProps {
  employees: Employee[];
}

export function TotalHoursChart({ employees }: TotalHoursChartProps) {
  const chartData = employees.map(emp => ({ name: emp.name.split(' ')[0], totalHours: emp.totalHours }));

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
          <Bar dataKey="totalHours" fill="var(--color-totalHours)" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
