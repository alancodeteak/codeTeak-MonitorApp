import type { Employee } from "@/lib/types";
import { EmployerDashboard } from "./employer-dashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TotalHoursChart } from "./charts/total-hours-chart";
import { DailyHoursChart } from "./charts/daily-hours-chart";
import { StatusDonutChart } from "./charts/status-donut-chart";

interface AdminDashboardProps {
  employees: Employee[];
  dailyHours: { date: string; hours: number }[];
}

export function AdminDashboard({ employees, dailyHours }: AdminDashboardProps) {
  return (
    <div className="space-y-6">
      <EmployerDashboard employees={employees} />

      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>
            Key metrics and trends for your organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Team Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <StatusDonutChart employees={employees} />
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Total Hours per Employee (Last 30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <TotalHoursChart employees={employees} />
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Daily Hours Trend (All Employees)</CardTitle>
              </CardHeader>
              <CardContent>
                <DailyHoursChart dailyHours={dailyHours} />
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
