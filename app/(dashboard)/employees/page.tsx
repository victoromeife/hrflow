// app/(dashboard)/employees/page.tsx
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageEmployees } from "@/lib/permissions";
import { EmploymentStatus } from "@/app/generated/prisma";
import { EmployeesClient } from "@/components/employees/employees-client";

export default async function EmployeesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const canManage = canManageEmployees(user);

  const [employees, departments] = await Promise.all([
    prisma.user.findMany({
      where: canManage ? {} : { id: user.id },
      include: { department: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
  ]);

  return <EmployeesClient user={user} employees={employees} departments={departments} canManage={canManage} />;
}