'use client';

import { usePathname } from 'next/navigation';

const pageTitles: { [key: string]: string } = {
  '/dashboard/employee': 'My Dashboard',
  '/dashboard/employer': 'Employer Dashboard & Analytics',
  '/dashboard/admin': 'Admin Analytics',
};

export function DashboardHeader() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || 'Dashboard';

  return (
    <h1 className="text-lg font-semibold md:text-2xl">{title}</h1>
  );
}
