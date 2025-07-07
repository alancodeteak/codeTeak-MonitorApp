export type UserRole = "employee" | "employer";

export interface Task {
  id: string;
  description: string;
  timestamp: Date;
}

export type EmployeeStatus = "Clocked In" | "Clocked Out" | "On Break";

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: "employee" | "employer"; // Simplified role
  status: EmployeeStatus;
  currentSessionStart?: Date;
  accumulatedTimeToday: number; // in milliseconds
  tasks: Task[];
  totalHours: number;
}
