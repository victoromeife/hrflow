// app/(dashboard)/departments/[id]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { canManageDepartments } from "@/lib/permissions";
import DepartmentDetailClient from "@/components/departments/department-detail-client";

export default async function DepartmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  const canManage = canManageDepartments(user);

  const department = await prisma.department.findUnique({
    where: { id },
    include: {
      head: true,
      employees: true,
      parent: true,
      children: { include: { head: true, employees: true } },
    },
  });
  if (!department) notFound();

  const allDepartments = await prisma.department.findMany({
    where: { id: { not: id } },
    select: { id: true, name: true, parentId: true },
    orderBy: { name: "asc" },
  });

  return <DepartmentDetailClient department={department} allDepartments={allDepartments} canManage={canManage} />;
}