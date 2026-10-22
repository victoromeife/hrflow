import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessDashboardStats } from "@/lib/permissions";
import { EmploymentStatus, LeaveStatus } from "@/app/generated/prisma";

export default async function DashboardPage() {
    const user = await getCurrentUser();
    if (!user) return null;

    const isManager = canAccessDashboardStats(user);

    let stats = {
        totalEmployees: 0,
        presentToday: 0,
        pendingLeaves: 0,
        totalDepartments: 0,
    };

    if (isManager) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [employees, present, pending, departments] = await Promise.all([
            prisma.user.count({ where: { employmentStatus: EmploymentStatus.ACTIVE } }),
            prisma.attendance.count({
                where: {
                    date: today,
                    clockIn: { not: null },
                },
            }),
            prisma.leaveRequest.count({ where: { status: LeaveStatus.PENDING } }),
            prisma.department.count(),
        ]);

        stats = {
            totalEmployees: employees,
            presentToday: present,
            pendingLeaves: pending,
            totalDepartments: departments,
        };
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">
                    Good {getGreeting()}, {user.fullName.split(" ")[0]}
                </h2>
                <p className="text-slate-400 mt-1">
                    {isManager
                        ? "Here’s what’s happening across the organization today."
                        : "Here’s your personal overview."}
                </p>
            </div>

            {isManager ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Total Employees" value={stats.totalEmployees} />
                    <StatCard label="Present Today" value={stats.presentToday} />
                    <StatCard label="Pending Leave" value={stats.pendingLeaves} />
                    <StatCard label="Departments" value={stats.totalDepartments} />
                </div>
            ) : (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
                    <p className="text-slate-300">
                        Welcome to HRFlow. Use the sidebar to clock in, request leave, or message your team.
                    </p>
                </div>
            )}
        </div>
    );
}

function StatCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
            <p className="text-sm text-slate-400">{label}</p>
            <p className="text-3xl font-bold mt-2 tracking-tight">{value}</p>
        </div>
    );
}

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return "morning";
    if (h < 17) return "afternoon";
    return "evening";
}