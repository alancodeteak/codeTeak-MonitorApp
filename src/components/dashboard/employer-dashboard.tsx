"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Employee, EmployeeStatus, Task } from "@/lib/types";
import { HoursToday } from "./hours-today";
import { TotalHoursChart } from "./charts/total-hours-chart";
import { DailyHoursChart } from "./charts/daily-hours-chart";
import { StatusDonutChart } from "./charts/status-donut-chart";
import { AreaHoursChart } from "./charts/area-hours-chart";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, arrayUnion, deleteDoc } from "firebase/firestore";
import { dailyHoursData } from "@/lib/data";
import { MoreHorizontal, BookUser, Pencil, Trash2, ClipboardPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

const editEmployeeSchema = z.object({
  name: z.string().min(2, "Name is required"),
});

const assignTaskSchema = z.object({
  description: z.string().min(5, "Task description must be at least 5 characters."),
});

type DialogState = {
  type: "viewTasks" | "assignTask" | "edit" | "delete" | null;
  employee: Employee | null;
}

export function EmployerDashboard() {
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogState, setDialogState] = React.useState<DialogState>({ type: null, employee: null });
  const [currentDate, setCurrentDate] = React.useState<string>("");
  const { toast } = useToast();

  const assignTaskForm = useForm<z.infer<typeof assignTaskSchema>>({
    resolver: zodResolver(assignTaskSchema),
    defaultValues: { description: "" },
  });
  
  const editEmployeeForm = useForm<z.infer<typeof editEmployeeSchema>>({
    resolver: zodResolver(editEmployeeSchema),
    defaultValues: { name: "" },
  });

  React.useEffect(() => {
    if (dialogState.type === 'edit' && dialogState.employee) {
      editEmployeeForm.reset({ name: dialogState.employee.name });
    }
    if (dialogState.type === 'assignTask') {
      assignTaskForm.reset({ description: "" });
    }
  }, [dialogState, editEmployeeForm, assignTaskForm]);


  React.useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "employee"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const emps: Employee[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        emps.push({
          ...data,
          id: doc.id,
          currentSessionStart: data.currentSessionStart?.toDate(),
          loggedTasks: (data.loggedTasks || []).map((task: any) => ({ ...task, timestamp: task.timestamp?.toDate() })),
          assignedTasks: (data.assignedTasks || []).map((task: any) => ({ ...task, timestamp: task.timestamp?.toDate() })),
        } as Employee);
      });
      setEmployees(emps);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    const date = new Date();
    setCurrentDate(date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);
  
  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setDialogState({ type: null, employee: null });
    }
  };
  
  const handleAssignTask = async (values: z.infer<typeof assignTaskSchema>) => {
    if (!dialogState.employee || !auth.currentUser) return;

    const newTask: Task = {
      id: `task_${Date.now()}`,
      description: values.description,
      timestamp: new Date(),
      status: 'pending',
      assignedBy: auth.currentUser.email || 'Employer',
    };

    try {
      await updateDoc(doc(db, "users", dialogState.employee.id), {
        assignedTasks: arrayUnion(newTask)
      });
      toast({ title: "Task Assigned", description: `Task assigned to ${dialogState.employee.name}.` });
      handleDialogChange(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleEditEmployee = async (values: z.infer<typeof editEmployeeSchema>) => {
    if (!dialogState.employee) return;
    try {
      await updateDoc(doc(db, "users", dialogState.employee.id), {
        name: values.name
      });
      toast({ title: "Employee Updated", description: `${values.name}'s profile has been updated.` });
      handleDialogChange(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleDeleteEmployee = async () => {
    if (!dialogState.employee) return;
    try {
      // This only deletes the Firestore record. For a full deletion,
      // you would need a Firebase Function to delete the user from Firebase Auth.
      await deleteDoc(doc(db, "users", dialogState.employee.id));
      toast({ title: "Employee Deleted", description: `${dialogState.employee.name} has been removed.` });
      handleDialogChange(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
             <Skeleton className="h-8 w-1/4" />
             <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Status</CardTitle>
          <CardDescription>
            Real-time overview of your team's activity.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setDialogState({ type: 'viewTasks', employee })}>
                              <BookUser className="mr-2 h-4 w-4" /> View Logged Tasks
                            </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => setDialogState({ type: 'assignTask', employee })}>
                              <ClipboardPlus className="mr-2 h-4 w-4" /> Assign New Task
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setDialogState({ type: 'edit', employee })}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit Employee
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => setDialogState({ type: 'delete', employee })}>
                              <Trash2 className="mr-2 h-4 w-4" /> Delete Employee
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>
            Key metrics and trends for your organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Team Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <StatusDonutChart employees={employees} />
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Total Hours per Employee (Last 30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <TotalHoursChart employees={employees} />
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Area Chart: Total Hours per Employee</CardTitle>
              </CardHeader>
              <CardContent>
                <AreaHoursChart employees={employees} />
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Daily Hours Trend (All Employees)</CardTitle>
              </CardHeader>
              <CardContent>
                <DailyHoursChart dailyHours={dailyHoursData} />
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

       {/* Dialogs */}
      <Dialog open={dialogState.type === 'viewTasks'} onOpenChange={handleDialogChange}>
          {dialogState.employee && (
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Logged Tasks for {dialogState.employee.name}</DialogTitle>
                <DialogDescription>
                  Tasks logged on {currentDate}.
                </DialogDescription>
              </DialogHeader>
              <div className="prose prose-sm dark:prose-invert max-h-64 overflow-y-auto rounded-md border p-4">
                {dialogState.employee.loggedTasks.length > 0 ? (
                  <ul>
                    {dialogState.employee.loggedTasks.map((task) => (
                      <li key={task.id}>{task.description}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No tasks logged for today.</p>
                )}
              </div>
              <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="secondary">Close</Button>
                  </DialogClose>
              </DialogFooter>
            </DialogContent>
          )}
      </Dialog>
      
      <Dialog open={dialogState.type === 'assignTask'} onOpenChange={handleDialogChange}>
        {dialogState.employee && (
            <DialogContent>
                 <DialogHeader>
                    <DialogTitle>Assign Task to {dialogState.employee.name}</DialogTitle>
                    <DialogDescription>
                        Enter the task details below. The employee will see this on their dashboard.
                    </DialogDescription>
                </DialogHeader>
                <Form {...assignTaskForm}>
                    <form onSubmit={assignTaskForm.handleSubmit(handleAssignTask)} className="space-y-4">
                        <FormField
                            control={assignTaskForm.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Task Description</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="e.g., Follow up with the new client" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                            <Button type="submit">Assign Task</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        )}
      </Dialog>

      <Dialog open={dialogState.type === 'edit'} onOpenChange={handleDialogChange}>
        {dialogState.employee && (
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit {dialogState.employee.name}</DialogTitle>
                    <DialogDescription>
                        Update the employee's details.
                    </DialogDescription>
                </DialogHeader>
                <Form {...editEmployeeForm}>
                    <form onSubmit={editEmployeeForm.handleSubmit(handleEditEmployee)} className="space-y-4">
                        <FormField
                            control={editEmployeeForm.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormItem>
                            <FormLabel>Email</FormLabel>
                            <Input value={dialogState.employee.email} disabled />
                        </FormItem>
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        )}
      </Dialog>

      <AlertDialog open={dialogState.type === 'delete'} onOpenChange={handleDialogChange}>
        {dialogState.employee && (
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the employee record for {dialogState.employee.name}. This does not remove their authentication account.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteEmployee} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </AlertDialog>
    </div>
  );
}
