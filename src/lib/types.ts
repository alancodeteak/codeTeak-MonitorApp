export type UserRole = "employee" | "employer" | "admin";

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
  role: UserRole;
  status: EmployeeStatus;
  clockInTime?: Date;
  tasks: Task[];
  totalHours: number;
}
