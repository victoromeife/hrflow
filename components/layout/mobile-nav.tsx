"use client";

import * as React from "react";
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
  const [open, setOpen] = React.useState(false);
  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Open navigation"
        className="p-2 rounded-lg text-slate-200 hover:bg-slate-800"
        onClick={() => setOpen(true)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <nav className="absolute left-0 top-0 h-full w-72 bg-slate-900 border-r border-slate-800 p-4 space-y-1 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-lg">HRFlow</span>
              <button type="button" aria-label="Close navigation" className="p-2 rounded-lg text-slate-300 hover:bg-slate-800" onClick={() => setOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-200 hover:bg-slate-800 hover:text-white transition"
              >
                <span className="opacity-80">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
