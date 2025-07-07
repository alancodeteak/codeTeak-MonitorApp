import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { mockEmployees, dailyHoursData } from "@/lib/data";

export default function AdminPage() {
    return <AdminDashboard employees={mockEmployees} dailyHours={dailyHoursData} />;
}
