import { EmployerDashboard } from "@/components/dashboard/employer-dashboard";
import { mockEmployees, dailyHoursData } from "@/lib/data";

export default function EmployerPage() {
    return <EmployerDashboard employees={mockEmployees} dailyHours={dailyHoursData} />;
}
