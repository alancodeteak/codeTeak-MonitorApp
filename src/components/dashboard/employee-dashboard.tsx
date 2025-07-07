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
import { Clock, LogIn, LogOut, Play, Square } from "lucide-react";
import type { EmployeeStatus } from "@/lib/types";

export function EmployeeDashboard() {
  const [status, setStatus] = useState<EmployeeStatus>("Clocked Out");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === "Clocked In" && startTime) {
      timer = setInterval(() => {
        setElapsedTime(new Date().getTime() - startTime.getTime());
      }, 1000);
    }
    return () => {
      clearInterval(timer);
    };
  }, [status, startTime]);

  const handleClockIn = () => {
    setStatus("Clocked In");
    setStartTime(new Date());
    setElapsedTime(0);
  };

  const handleClockOut = () => {
    setStatus("Clocked Out");
    setStartTime(null);
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const isClockedIn = status === "Clocked In";

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Time Clock</CardTitle>
          <CardDescription>Your current work status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4 rounded-md border p-4">
            <Clock className="h-6 w-6" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">Status</p>
              <p className={`text-sm ${isClockedIn ? 'text-green-600' : 'text-muted-foreground'}`}>
                {status}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4 rounded-md border p-4">
             <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">Hours Worked Today</p>
                <p className="text-2xl font-bold font-mono">{formatTime(elapsedTime)}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          {isClockedIn ? (
            <Button onClick={handleClockOut} className="w-full bg-red-600 hover:bg-red-700">
              <LogOut className="mr-2 h-4 w-4" /> Clock Out
            </Button>
          ) : (
            <Button onClick={handleClockIn} className="w-full bg-green-600 hover:bg-green-700">
              <LogIn className="mr-2 h-4 w-4" /> Clock In
            </Button>
          )}
        </CardFooter>
      </Card>

      <Card className="lg:col-span-2">
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
