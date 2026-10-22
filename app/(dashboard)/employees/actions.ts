// app/(dashboard)/employees/actions.ts
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, getCurrentUser, hashPassword } from "@/lib/auth";
import { canManageEmployees } from "@/lib/permissions";
import { employeeSchema } from "@/lib/validations";
import { ActivityAction } from "@/lib/activity";
import { EmploymentStatus, Role } from "@/app/generated/prisma";

export type EmployeeState = {
  error?: string;
  success?: string;
};

export async function createEmployee(
  _prev: EmployeeState,
  formData: FormData
): Promise<EmployeeState> {
  const user = await requireAuth();
  if (!canManageEmployees(user)) {
    return { error: "Not authorized" };
  }

  const raw = {
    fullName: formData.get("fullName") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string | undefined,
    position: formData.get("position") as string,
    departmentId: formData.get("departmentId") as string | undefined,
    employmentStatus: (formData.get("employmentStatus") as string) || "ACTIVE",
  };

  const parsed = employeeSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const existing = await prisma.user.findUnique({ where: { email: raw.email } });
  if (existing) {
    return { error: "Email already registered" };
  }

  const password = await hashPassword("Welcome@123");

  const employee = await prisma.user.create({
    data: {
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      position: parsed.data.position,
      departmentId: parsed.data.departmentId || null,
      employmentStatus: parsed.data.employmentStatus as EmploymentStatus,
      password,
      role: Role.EMPLOYEE,
    },
  });

  await ActivityAction.log(user.id, "EMPLOYEE_CREATED", "User", employee.id);

  revalidatePath("/employees");
  return { success: "Employee created" };
}

export async function updateEmployee(
  _prev: EmployeeState,
  formData: FormData
): Promise<EmployeeState> {
  const user = await requireAuth();
  if (!canManageEmployees(user)) {
    return { error: "Not authorized" };
  }

  const id = formData.get("id") as string;
  if (!id) return { error: "Missing employee id" };

  const raw = {
    fullName: formData.get("fullName") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string | undefined,
    position: formData.get("position") as string,
    departmentId: formData.get("departmentId") as string | undefined,
    employmentStatus: (formData.get("employmentStatus") as string) || "ACTIVE",
  };

  const parsed = employeeSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return { error: "Employee not found" };

  if (existing.email !== raw.email) {
    const emailTaken = await prisma.user.findUnique({ where: { email: raw.email } });
    if (emailTaken) return { error: "Email already in use" };
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      position: parsed.data.position,
      departmentId: parsed.data.departmentId || null,
      employmentStatus: parsed.data.employmentStatus as EmploymentStatus,
    },
  });

  await ActivityAction.log(user.id, "EMPLOYEE_UPDATED", "User", updated.id);

  revalidatePath("/employees");
  revalidatePath(`/employees/${id}`);
  return { success: "Employee updated" };
}

export async function deactivateEmployee(id: string): Promise<EmployeeState> {
  const user = await requireAuth();
  if (!canManageEmployees(user)) {
    return { error: "Not authorized" };
  }

  const employee = await prisma.user.findUnique({ where: { id } });
  if (!employee) return { error: "Employee not found" };

  await prisma.user.update({
    where: { id },
    data: { employmentStatus: EmploymentStatus.INACTIVE },
  });

  await ActivityAction.log(user.id, "EMPLOYEE_DEACTIVATED", "User", id);

  revalidatePath("/employees");
  return { success: "Employee deactivated" };
}

export async function deleteEmployee(id: string): Promise<EmployeeState> {
  const user = await requireAuth();
  if (user.role !== Role.ADMIN) {
    return { error: "Only admins can delete employees" };
  }

  const employee = await prisma.user.findUnique({ where: { id } });
  if (!employee) return { error: "Employee not found" };

  await prisma.user.delete({ where: { id } });

  await ActivityAction.log(user.id, "EMPLOYEE_DELETED", "User", id);

  revalidatePath("/employees");
  return { success: "Employee deleted" };
}