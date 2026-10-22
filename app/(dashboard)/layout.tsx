import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/(auth)/actions";
import Link from "next/link";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "▦" },
    { href: "/employees", label: "Employees", icon: "👤" },
    { href: "/departments", label: "Departments", icon: "🏢" },
    { href: "/attendance", label: "Attendance", icon: "⏱" },
    { href: "/leave", label: "Leave", icon: "📅" },
    { href: "/messages", label: "Messages", icon: "💬" },
];

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-slate-800 bg-slate-900/50 hidden md:flex flex-col">
                <div className="p-5 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center font-bold">
                            H
                        </div>
                        <span className="font-semibold text-lg tracking-tight">HRFlow</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition"
                        >
                            <span className="text-lg opacity-70">{item.icon}</span>
                            <span className="text-sm font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-sm font-semibold">
                            {user.fullName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{user.fullName}</p>
                            <p className="text-xs text-slate-500 truncate">{user.role.replace("_", " ")}</p>
                        </div>
                    </div>
                    <form action={logoutAction}>
                        <button
                            type="submit"
                            className="w-full text-left text-sm text-slate-400 hover:text-red-400 transition px-1"
                        >
                            Sign out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950/80 backdrop-blur sticky top-0 z-10">
                    <h1 className="text-sm font-medium text-slate-400">HR & Internal Communication</h1>
                    <div className="md:hidden flex items-center gap-2">
                        <span className="text-sm text-slate-300">{user.fullName}</span>
                    </div>
                </header>

                <main className="flex-1 p-6 overflow-auto">{children}</main>
            </div>
        </div>
    );
}