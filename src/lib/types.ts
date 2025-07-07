export type UserRole = "employee" | "employer";

export interface Task {
  id: string;
  description: string;
  timestamp: Date;
  status: "pending" | "completed";
  assignedBy?: string; // email of employer
}

export type EmployeeStatus = "Clocked In" | "Clocked Out" | "On Break";

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: "employee" | "employer"; // Simplified role
  status: EmployeeStatus;
  currentSessionStart?: Date | null;
  accumulatedTimeToday: number; // in milliseconds
  loggedTasks: Task[];
  assignedTasks: Task[];
  totalHours: number;
}
