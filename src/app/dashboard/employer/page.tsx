import { EmployerDashboard } from "@/components/dashboard/employer-dashboard";
import { mockEmployees } from "@/lib/data";

export default function EmployerPage() {
    return <EmployerDashboard employees={mockEmployees} />;
}
