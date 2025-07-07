"use client";

import { useState, useEffect } from "react";
import type { EmployeeStatus } from "@/lib/types";

interface HoursTodayProps {
    status: EmployeeStatus;
    accumulatedTime: number; // in ms
    sessionStart?: Date;
    showSeconds?: boolean;
}

const formatTime = (ms: number, showSeconds: boolean = false) => {
    const safeMs = Math.max(0, ms);
    const totalSeconds = Math.floor(safeMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (showSeconds) {
        const seconds = totalSeconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export function HoursToday({ status, accumulatedTime, sessionStart, showSeconds = false }: HoursTodayProps) {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        if (status !== 'Clocked In' || !sessionStart) {
            setElapsed(0);
            return;
        }

        const updateElapsed = () => {
             const startTime = new Date(sessionStart).getTime();
             setElapsed(new Date().getTime() - startTime);
        }

        updateElapsed();
        const timer = setInterval(updateElapsed, 1000);
        
        return () => clearInterval(timer);
    }, [status, sessionStart]);

    const totalTimeToday = accumulatedTime + elapsed;

    return <>{formatTime(totalTimeToday, showSeconds)}</>;
}
