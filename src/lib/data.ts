import type { Employee } from './types';

export const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'employee',
    status: 'Clocked In',
    clockInTime: new Date(new Date().setHours(new Date().getHours() - 2)),
    tasks: [{ id: 't1', description: 'Worked on feature X.', timestamp: new Date() }],
    totalHours: 7.5,
  },
  {
    id: '2',
    name: 'Bob Williams',
    email: 'bob@example.com',
    role: 'employee',
    status: 'Clocked Out',
    tasks: [{ id: 't2', description: 'Client meeting and follow-up emails.', timestamp: new Date() }],
    totalHours: 8.0,
  },
  {
    id: '3',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    role: 'employee',
    status: 'On Break',
    clockInTime: new Date(new Date().setHours(new Date().getHours() - 4)),
    tasks: [{ id: 't3', description: 'Initial project setup for Project Y.', timestamp: new Date() }],
    totalHours: 6.2,
  },
  {
    id: '4',
    name: 'Diana Prince',
    email: 'diana@example.com',
    role: 'employee',
    status: 'Clocked In',
    clockInTime: new Date(new Date().setHours(new Date().getHours() - 1)),
    tasks: [{ id: 't4', description: 'Debugging production issue.', timestamp: new Date() }],
    totalHours: 5.8,
  },
    {
    id: '5',
    name: 'Ethan Hunt',
    email: 'ethan@example.com',
    role: 'employee',
    status: 'Clocked Out',
    tasks: [{ id: 't5', description: 'Completed quarterly report.', timestamp: new Date() }],
    totalHours: 8.1,
  },
];

export const dailyHoursData = [
  { date: 'Mon', hours: 32 },
  { date: 'Tue', hours: 40 },
  { date: 'Wed', hours: 38 },
  { date: 'Thu', hours: 45 },
  { date: 'Fri', hours: 42 },
  { date: 'Sat', hours: 10 },
  { date: 'Sun', hours: 4 },
];
