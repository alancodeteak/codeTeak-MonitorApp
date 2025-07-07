import { redirect } from 'next/navigation';

// The admin role has been consolidated into the employer role.
// This page now redirects to the employer dashboard for convenience.
export default function AdminPage() {
    redirect('/dashboard/employer');
}
