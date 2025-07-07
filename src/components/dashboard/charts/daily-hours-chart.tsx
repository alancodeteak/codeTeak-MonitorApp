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
                stroke="var(--color-hours)"
                strokeWidth={2}
                dot={true}
            />
            </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
