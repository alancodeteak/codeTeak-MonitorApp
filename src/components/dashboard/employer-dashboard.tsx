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
import type { Employee, EmployeeStatus } from "@/lib/types";
import { HoursToday } from "./hours-today";

interface EmployerDashboardProps {
  employees: Employee[];
}

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


export function EmployerDashboard({ employees }: EmployerDashboardProps) {
  const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null);
  const [currentDate, setCurrentDate] = React.useState<string>("");

  React.useEffect(() => {
    const date = new Date();
    setCurrentDate(date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  return (
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
  );
}
