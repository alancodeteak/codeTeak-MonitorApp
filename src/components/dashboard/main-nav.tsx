'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Briefcase,
  LayoutDashboard,
  Users,
  BarChartBig,
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    href: '/dashboard/employee',
    label: 'My Dashboard',
    icon: LayoutDashboard,
    roles: ['employee', 'employer'],
  },
  {
    href: '/dashboard/employer',
    label: 'Team View',
    icon: Users,
    roles: ['employer'],
  },
];

// In a real app, you'd get this from your auth context
const currentUserRole = 'employer'; 

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();

  const accessibleMenuItems = menuItems.filter(item => item.roles.includes(currentUserRole));

  return (
    <nav className={cn('flex flex-col', className)} {...props}>
      <SidebarMenu>
        {accessibleMenuItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href}
              tooltip={item.label}
            >
              <Link href={item.href}>
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </nav>
  );
}
