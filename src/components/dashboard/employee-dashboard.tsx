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
import { Clock, LogIn, LogOut, MapPin } from "lucide-react";
import type { Employee } from "@/lib/types";
import { mockEmployees } from "@/lib/data";
import { HoursToday } from "./hours-today";
import { useToast } from "@/hooks/use-toast";
import { getDistance } from "@/lib/utils";

// In a real app, this would come from an auth context or API call
const currentEmployeeId = '1';

// Constants for location verification
const OFFICE_COORDS = { latitude: 12.874256, longitude: 77.613996 };
const MAX_DISTANCE_METERS = 30;


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
  const [isVerifyingLocation, setIsVerifyingLocation] = useState(false);
  const { toast } = useToast();

  const handleClockIn = useCallback(async () => {
    setIsVerifyingLocation(true);

    const getLocation = (): Promise<GeolocationPosition> => {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation is not supported by your browser."));
        }
        // Set a timeout for the location request
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
      });
    };

    try {
      const position = await getLocation();
      const { latitude, longitude } = position.coords;

      const distance = getDistance(
        latitude,
        longitude,
        OFFICE_COORDS.latitude,
        OFFICE_COORDS.longitude
      );

      if (distance > MAX_DISTANCE_METERS) {
        toast({
          variant: "destructive",
          title: "Clock-in Failed",
          description: `You must be within ${MAX_DISTANCE_METERS} meters of the office to clock in. You are ~${Math.round(distance)}m away.`,
        });
        return;
      }

      const updatedEmployee = {
          ...employee,
          status: "Clocked In" as const,
          currentSessionStart: new Date(),
      };
      setEmployee(updatedEmployee);
      updateMockEmployee(updatedEmployee);

    } catch (error: any) {
      let description = "An unknown error occurred while verifying your location.";
      if (error.code === 1) { // PERMISSION_DENIED
        description = "Location access was denied. Please enable location permissions in your browser settings to clock in.";
      } else if (error.code === 2) { // POSITION_UNAVAILABLE
        description = "Your location could not be determined. Please check your network connection and try again.";
      } else if (error.code === 3) { // TIMEOUT
        description = "The request to get your location timed out. Please try again.";
      } else if (error instanceof Error) {
        description = error.message;
      }

      toast({
        variant: "destructive",
        title: "Location Verification Failed",
        description,
      });
    } finally {
      setIsVerifyingLocation(false);
    }
  }, [employee, toast]);

  const handleClockOut = useCallback(() => {
    if (employee.status !== 'Clocked In') return;

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
  }, [employee]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (employee.status === 'Clocked In') {
         handleClockOut();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
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
             <Button 
              onClick={handleClockIn} 
              className="w-full" 
              disabled={isVerifyingLocation}
            >
                {isVerifyingLocation ? (
                    <>
                        <MapPin className="mr-2 h-4 w-4 animate-pulse" /> Verifying Location...
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
          />
        </CardContent>
        <CardFooter>
          <Button>Save Log</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
