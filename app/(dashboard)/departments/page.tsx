// app/(dashboard)/departments/page.tsx
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageDepartments } from "@/lib/permissions";
import { DepartmentsClient } from "@/components/departments/departments-client";

export default async function DepartmentsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const canManage = canManageDepartments(user);

  const [departments, employees] = await Promise.all([
    prisma.department.findMany({
      include: { head: true, employees: true, parent: true, children: true },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where: { employmentStatus: "ACTIVE" },
      select: { id: true, fullName: true, email: true },
      orderBy: { fullName: "asc" },
    }),
  ]);

  return <DepartmentsClient departments={departments} employees={employees} canManage={canManage} />;
}