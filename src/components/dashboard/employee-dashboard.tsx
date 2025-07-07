"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Clock, LogIn, LogOut } from "lucide-react";
import type { Employee } from "@/lib/types";
import { mockEmployees } from "@/lib/data";
import { HoursToday } from "./hours-today";

// In a real app, this would come from an auth context or API call
const currentEmployeeId = '1';

// In a real app, you would have an API to update the employee data.
// Here we are mocking this behavior by mutating the imported array.
const updateMockEmployee = (updatedEmployee: Employee) => {
    const index = mockEmployees.findIndex(e => e.id === updatedEmployee.id);
    if (index !== -1) {
        mockEmployees[index] = updatedEmployee;
    }
}

export function EmployeeDashboard() {
  const [employee, setEmployee] = useState<Employee>(() => {
    const emp = mockEmployees.find(e => e.id === currentEmployeeId);
    if (!emp) {
      // This should not happen in a real app with proper auth
      throw new Error("Employee not found");
    }
    return emp;
  });

  const handleClockIn = () => {
    const updatedEmployee = {
        ...employee,
        status: "Clocked In" as const,
        currentSessionStart: new Date(),
    };
    setEmployee(updatedEmployee);
    updateMockEmployee(updatedEmployee);
  };

  const handleClockOut = () => {
    const sessionDuration = employee.currentSessionStart 
      ? new Date().getTime() - new Date(employee.currentSessionStart).getTime()
      : 0;
    
    const updatedEmployee = {
        ...employee,
        status: "Clocked Out" as const,
        currentSessionStart: undefined,
        accumulatedTimeToday: employee.accumulatedTimeToday + sessionDuration,
    };
    setEmployee(updatedEmployee);
    updateMockEmployee(updatedEmployee);
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      // Auto-pause when tab is hidden (e.g., user switches tabs, minimizes, or system sleeps)
      if (document.hidden && employee.status === "Clocked In") {
        handleClockOut();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
    // Re-run the effect if handleClockOut or employee.status changes
  }, [employee.status, handleClockOut]);


  const isClockedIn = employee.status === "Clocked In";

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Time Clock</CardTitle>
          <CardDescription>Your current work status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4 rounded-md border p-4">
            <Clock className="h-6 w-6 text-muted-foreground" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">Status</p>
              <p className={`text-sm font-semibold ${isClockedIn ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                {employee.status}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4 rounded-md border p-4">
             <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">Hours Worked Today</p>
                <p className="text-3xl font-bold font-mono">
                    <HoursToday
                      status={employee.status}
                      accumulatedTime={employee.accumulatedTimeToday}
                      sessionStart={employee.currentSessionStart}
                      showSeconds={true}
                    />
                </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          {isClockedIn ? (
            <Button onClick={handleClockOut} className="w-full" variant="destructive">
              <LogOut className="mr-2 h-4 w-4" /> Clock Out
            </Button>
          ) : (
            <Button onClick={handleClockIn} className="w-full">
              <LogIn className="mr-2 h-4 w-4" /> Clock In
            </Button>
          )}
        </CardFooter>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Daily Task Log</CardTitle>
          <CardDescription>
            Log your tasks for the day. This will be visible to your employer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="What are you working on today?"
            className="min-h-[200px] resize-none"
          />
        </CardContent>
        <CardFooter>
          <Button>Save Log</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
