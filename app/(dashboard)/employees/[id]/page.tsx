// app/(dashboard)/employees/[id]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { canManageEmployees } from "@/lib/permissions";
import EmployeeDetailClient from "./client";

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  const canManage = canManageEmployees(user);
  if (!canManage && user.id !== id) {
    return (
      <div className="p-6 text-center text-slate-400">Access denied.</div>
    );
  }

  const employee = await prisma.user.findUnique({
    where: { id },
    include: { department: true },
  });
  if (!employee) notFound();

  const [attendances, leaves, departments] = await Promise.all([
    prisma.attendance.findMany({ where: { userId: id }, orderBy: { date: "desc" }, take: 20 }),
    prisma.leaveRequest.findMany({ where: { userId: id }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
  ]);

  return <EmployeeDetailClient employee={employee} attendances={attendances} leaves={leaves} canManage={canManage} departments={departments} />;
}