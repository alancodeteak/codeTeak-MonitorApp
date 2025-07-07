"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Clock, LogIn, LogOut, Loader2, ClipboardCheck } from "lucide-react";
import type { Employee, Task } from "@/lib/types";
import { HoursToday } from "./hours-today";
import { useToast } from "@/hooks/use-toast";
import { getDistance } from "@/lib/utils";
import { auth, db } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc, arrayUnion, increment } from "firebase/firestore";
import { onAuthStateChanged, type User } from "firebase/auth";
import { Skeleton } from "../ui/skeleton";
import { Badge } from "../ui/badge";

const OFFICE_COORDS = { latitude: 12.874256, longitude: 77.613996 };
const MAX_DISTANCE_METERS = 30;

export function EmployeeDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVerifyingLocation, setIsVerifyingLocation] = useState(false);
  const [taskLog, setTaskLog] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const docRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const employeeData: Employee = {
          ...data,
          id: docSnap.id,
          currentSessionStart: data.currentSessionStart?.toDate(),
          loggedTasks: (data.loggedTasks || []).map((task: any) => ({
            ...task,
            timestamp: task.timestamp.toDate(),
          })),
          assignedTasks: (data.assignedTasks || []).map((task: any) => ({
            ...task,
            timestamp: task.timestamp.toDate(),
          })),
        } as Employee;
        setEmployee(employeeData);
      } else {
        console.error("Employee data not found in Firestore.");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);
  
  const handleClockIn = useCallback(async () => {
    if (!user) return;
    setIsVerifyingLocation(true);

    const getLocation = (): Promise<GeolocationPosition> => {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation is not supported by your browser."));
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
      });
    };

    try {
      const position = await getLocation();
      const { latitude, longitude } = position.coords;
      const distance = getDistance(latitude, longitude, OFFICE_COORDS.latitude, OFFICE_COORDS.longitude);

      if (distance > MAX_DISTANCE_METERS) {
        toast({
          variant: "destructive",
          title: "Clock-in Failed",
          description: `You must be within ${MAX_DISTANCE_METERS} meters of the office to clock in. You are ~${Math.round(distance)}m away.`,
        });
        return;
      }

      await updateDoc(doc(db, "users", user.uid), {
        status: "Clocked In",
        currentSessionStart: new Date(),
      });

    } catch (error: any) {
      let description = "An unknown error occurred while verifying your location.";
      if (error.code === 1) description = "Location access was denied. Please enable location permissions.";
      else if (error.code === 2) description = "Your location could not be determined.";
      else if (error.code === 3) description = "The request to get your location timed out.";
      else if (error instanceof Error) description = error.message;

      toast({ variant: "destructive", title: "Location Verification Failed", description });
    } finally {
      setIsVerifyingLocation(false);
    }
  }, [user, toast]);

  const handleClockOut = useCallback(async () => {
    if (!user || !employee || employee.status !== 'Clocked In') return;

    const sessionDuration = employee.currentSessionStart
      ? (new Date().getTime() - new Date(employee.currentSessionStart).getTime()) / 3600000 // duration in hours
      : 0;

    await updateDoc(doc(db, "users", user.uid), {
      status: "Clocked Out",
      currentSessionStart: null,
      accumulatedTimeToday: employee.accumulatedTimeToday + (sessionDuration * 3600000), // back to ms
      totalHours: increment(sessionDuration)
    });
  }, [user, employee]);
  
  const handleSaveLog = async () => {
    if (!user || !taskLog.trim()) return;
    try {
      const newTask: Omit<Task, 'timestamp'> = {
        id: `task_${Date.now()}`,
        description: taskLog,
        status: 'completed', // Logged tasks are implicitly completed
      }
      await updateDoc(doc(db, "users", user.uid), {
        loggedTasks: arrayUnion({
          ...newTask,
          timestamp: new Date(),
        })
      });
      setTaskLog("");
      toast({
          title: "Log Saved",
          description: "Your task has been successfully logged.",
      });
    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Error Saving Log",
        description: error.message,
      });
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    if (!user || !employee) return;
    try {
      const updatedTasks = employee.assignedTasks.map(task =>
        task.id === taskId ? { ...task, status: 'completed' } : task
      );
      await updateDoc(doc(db, "users", user.uid), {
        assignedTasks: updatedTasks,
      });
      toast({
        title: "Task Completed",
        description: "Great job!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error Updating Task",
        description: error.message,
      });
    }
  };

  useEffect(() => {
    window.addEventListener("beforeunload", handleClockOut);
    return () => window.removeEventListener("beforeunload", handleClockOut);
  }, [handleClockOut]);
  
  if (loading) {
    return (
       <div className="grid auto-rows-min gap-6 md:grid-cols-3">
         <Card className="md:col-span-1">
            <CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader>
            <CardContent className="space-y-4"><Skeleton className="h-24 w-full" /></CardContent>
            <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader>
            <CardContent><Skeleton className="h-48 w-full" /></CardContent>
            <CardFooter><Skeleton className="h-10 w-24" /></CardFooter>
          </Card>
          <Card className="md:col-span-3">
            <CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader>
            <CardContent><Skeleton className="h-32 w-full" /></CardContent>
          </Card>
       </div>
    );
  }

  if (!employee) {
    return <div>Employee data could not be loaded.</div>;
  }
  
  const isClockedIn = employee.status === "Clocked In";
  const pendingTasks = employee.assignedTasks.filter(t => t.status === 'pending');

  return (
    <div className="grid auto-rows-min gap-6 md:grid-cols-3">
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
             <Button 
              onClick={handleClockIn} 
              className="w-full" 
              disabled={isVerifyingLocation}
            >
                {isVerifyingLocation ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
                    </>
                ) : (
                     <>
                        <LogIn className="mr-2 h-4 w-4" /> Clock In
                    </>
                )}
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
            value={taskLog}
            onChange={(e) => setTaskLog(e.target.value)}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveLog}>Save Log</Button>
        </CardFooter>
      </Card>
      
      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle>Assigned Tasks</CardTitle>
          <CardDescription>
            Tasks assigned to you by your employer. Mark them as complete when you're done.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingTasks.length > 0 ? (
            <ul className="space-y-4">
              {pendingTasks.map((task) => (
                <li key={task.id} className="flex items-center justify-between rounded-md border p-4">
                  <div className="space-y-1">
                    <p className="font-medium">{task.description}</p>
                    <p className="text-sm text-muted-foreground">Assigned by: {task.assignedBy}</p>
                  </div>
                  <Button size="sm" onClick={() => handleCompleteTask(task.id)}>
                    <ClipboardCheck className="mr-2" /> Mark as Done
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No pending tasks. Great job!</p>
          )}
          {employee.assignedTasks.filter(t => t.status === 'completed').length > 0 && (
             <div className="mt-4">
                <h4 className="text-sm font-medium text-muted-foreground">Completed Today</h4>
                <ul className="mt-2 space-y-2">
                {employee.assignedTasks.filter(t => t.status === 'completed').map(task => (
                    <li key={task.id} className="flex items-center gap-3 text-muted-foreground">
                        <ClipboardCheck className="text-emerald-500" />
                        <span className="line-through">{task.description}</span>
                    </li>
                ))}
                </ul>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
