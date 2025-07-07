"use client"

import { Line, LineChart, CartesianGrid, XAxis, ResponsiveContainer, Tooltip } from "recharts"
import { ChartTooltipContent, ChartContainer, ChartTooltip } from "@/components/ui/chart"

interface DailyHoursChartProps {
  dailyHours: { date: string, hours: number }[]
}

export function DailyHoursChart({ dailyHours }: DailyHoursChartProps) {
    const chartConfig = {
        hours: {
            label: "Hours",
            color: "hsl(var(--primary))",
        },
    }

  const gradientId = "line-gradient";

  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
        <ResponsiveContainer>
            <LineChart
            data={dailyHours}
            margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
            }}
            >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Line
                dataKey="hours"
                type="monotone"
                stroke={`url(#${gradientId})`}
                strokeWidth={3}
                dot={{ r: 5, stroke: '#fff', strokeWidth: 2, fill: '#6366F1' }}
            />
            </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
