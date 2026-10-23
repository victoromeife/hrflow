"use client";

import Link from "next/link";
import { DashboardIcon, UsersIcon, BuildingIcon, ClockIcon, CalendarIcon, MessageSquareIcon } from "@/components/icons";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: <DashboardIcon className="w-5 h-5" /> },
  { href: "/employees", label: "Employees", icon: <UsersIcon className="w-5 h-5" /> },
  { href: "/departments", label: "Departments", icon: <BuildingIcon className="w-5 h-5" /> },
  { href: "/attendance", label: "Attendance", icon: <ClockIcon className="w-5 h-5" /> },
  { href: "/leave", label: "Leave", icon: <CalendarIcon className="w-5 h-5" /> },
  { href: "/messages", label: "Messages", icon: <MessageSquareIcon className="w-5 h-5" /> },
];

export function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 flex items-center justify-around px-2 py-2">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex flex-col items-center gap-1 text-slate-300 hover:text-white transition px-2 py-1"
        >
          <span className="opacity-80">{item.icon}</span>
          <span className="text-[10px] font-medium">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}