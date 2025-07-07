"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Employee, EmployeeStatus } from "@/lib/types";
import { HoursToday } from "./hours-today";
import { TotalHoursChart } from "./charts/total-hours-chart";
import { DailyHoursChart } from "./charts/daily-hours-chart";
import { StatusDonutChart } from "./charts/status-donut-chart";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { dailyHoursData } from "@/lib/data";


const statusVariant: { [key in EmployeeStatus]: "default" | "secondary" | "destructive" } = {
  "Clocked In": "default",
  "Clocked Out": "secondary",
  "On Break": "destructive",
};

const statusColor: { [key in EmployeeStatus]: string } = {
  "Clocked In": "bg-emerald-500",
  "On Break": "bg-amber-500",
  "Clocked Out": "bg-slate-500",
};


export function EmployerDashboard() {
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null);
  const [currentDate, setCurrentDate] = React.useState<string>("");

  React.useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "employee"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const emps: Employee[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        emps.push({
          ...data,
          id: doc.id,
          currentSessionStart: data.currentSessionStart?.toDate(),
          tasks: data.tasks.map((task: any) => ({ ...task, timestamp: task.timestamp?.toDate() })),
        } as Employee);
      });
      setEmployees(emps);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    const date = new Date();
    setCurrentDate(date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);
  
  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
             <Skeleton className="h-8 w-1/4" />
             <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Status</CardTitle>
          <CardDescription>
            Real-time overview of your team's activity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={!!selectedEmployee} onOpenChange={(open) => !open && setSelectedEmployee(null)}>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Clocked In At</TableHead>
                    <TableHead>Hours Today</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {employee.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[employee.status]} className="flex items-center gap-2 w-fit">
                          <span className={`h-2 w-2 rounded-full ${statusColor[employee.status]}`} />
                          {employee.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {employee.status === 'Clocked In' && employee.currentSessionStart
                          ? new Date(employee.currentSessionStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <HoursToday 
                          status={employee.status}
                          accumulatedTime={employee.accumulatedTimeToday}
                          sessionStart={employee.currentSessionStart}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedEmployee(employee)}
                          >
                            View Tasks
                          </Button>
                        </DialogTrigger>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {selectedEmployee && (
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Daily Tasks for {selectedEmployee.name}</DialogTitle>
                  <DialogDescription>
                    Tasks logged on {currentDate}.
                  </DialogDescription>
                </DialogHeader>
                <div className="prose prose-sm dark:prose-invert max-h-64 overflow-y-auto rounded-md border p-4">
                  {selectedEmployee.tasks.length > 0 ? (
                    <ul>
                      {selectedEmployee.tasks.map((task) => (
                        <li key={task.id}>{task.description}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No tasks logged for today.</p>
                  )}
                </div>
                <DialogFooter>
                   <Button variant="secondary" onClick={() => setSelectedEmployee(null)}>Close</Button>
                </DialogFooter>
              </DialogContent>
            )}
          </Dialog>
        </CardContent>
      </Card>
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
                <DailyHoursChart dailyHours={dailyHoursData} />
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
