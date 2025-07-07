"use client"

import * as React from "react"
import { Pie, PieChart, ResponsiveContainer } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import type { Employee } from "@/lib/types"

interface StatusDonutChartProps {
  employees: Employee[];
}

export function StatusDonutChart({ employees }: StatusDonutChartProps) {
  const statusCounts = employees.reduce((acc, emp) => {
    acc[emp.status] = (acc[emp.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
    fill: `var(--color-${status.toLowerCase().replace(" ", "")})`,
  }));

  const chartConfig = {
    count: {
      label: "Employees",
    },
    clockedin: {
      label: "Clocked In",
      color: "hsl(var(--chart-1))",
    },
    clockedout: {
      label: "Clocked Out",
      color: "hsl(var(--chart-2))",
    },
    onbreak: {
      label: "On Break",
      color: "hsl(var(--chart-3))",
    },
  }

  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px]">
      <ResponsiveContainer>
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={chartData}
            dataKey="count"
            nameKey="status"
            innerRadius={60}
            strokeWidth={5}
          />
          <ChartLegend
            content={<ChartLegendContent nameKey="status" />}
            className="-translate-y-[2rem] flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
