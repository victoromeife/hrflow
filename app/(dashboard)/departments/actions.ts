// app/(dashboard)/departments/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { canManageDepartments } from "@/lib/permissions";
import { departmentSchema } from "@/lib/validations";
import { ActivityAction } from "@/lib/activity";
import { EmploymentStatus } from "@/app/generated/prisma";

export type DepartmentState = {
  error?: string;
  success?: string;
};

export async function createDepartment(
  _prev: DepartmentState = {},
  formData: FormData
): Promise<DepartmentState> {
  const user = await requireAuth();
  if (!canManageDepartments(user)) return { error: "Not authorized" };

  const raw = {
    name: formData.get("name") as string,
    description: formData.get("description") as string | undefined,
    parentId: formData.get("parentId") as string | undefined,
    headId: formData.get("headId") as string | undefined,
  };

  const parsed = departmentSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  // Validate head is active employee
  if (parsed.data.headId) {
    const head = await prisma.user.findUnique({ where: { id: parsed.data.headId } });
    if (!head || head.employmentStatus !== EmploymentStatus.ACTIVE) {
      return { error: "Department head must be an active employee" };
    }
  }

  // Check for circular hierarchy
  if (parsed.data.parentId) {
    const cycle = await wouldCreateCycle(parsed.data.parentId, null);
    if (cycle) return { error: "Invalid parent: would create a circular hierarchy" };
  }

  const dept = await prisma.department.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      parentId: parsed.data.parentId || null,
      headId: parsed.data.headId || null,
    },
  });

  // If head assigned, update user's department if not already set
  if (parsed.data.headId) {
    await prisma.user.update({
      where: { id: parsed.data.headId },
      data: { departmentId: dept.id },
    });
  }

  await ActivityAction.log(user.id, "DEPARTMENT_CREATED", "Department", dept.id);
  revalidatePath("/departments");
  return { success: "Department created" };
}

export async function updateDepartment(
  _prev: DepartmentState = {},
  formData: FormData
): Promise<DepartmentState> {
  const user = await requireAuth();
  if (!canManageDepartments(user)) return { error: "Not authorized" };

  const id = formData.get("id") as string;
  if (!id) return { error: "Missing department id" };

  const raw = {
    name: formData.get("name") as string,
    description: formData.get("description") as string | undefined,
    parentId: formData.get("parentId") as string | undefined,
    headId: formData.get("headId") as string | undefined,
  };

  const parsed = departmentSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const existing = await prisma.department.findUnique({ where: { id } });
  if (!existing) return { error: "Department not found" };

  if (parsed.data.parentId === id) return { error: "A department cannot be its own parent" };

  if (parsed.data.headId) {
    const head = await prisma.user.findUnique({ where: { id: parsed.data.headId } });
    if (!head || head.employmentStatus !== EmploymentStatus.ACTIVE) {
      return { error: "Department head must be an active employee" };
    }
  }

  if (parsed.data.parentId) {
    const cycle = await wouldCreateCycle(parsed.data.parentId, id);
    if (cycle) return { error: "Invalid parent: would create a circular hierarchy" };
  }

  await prisma.department.update({
    where: { id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      parentId: parsed.data.parentId || null,
      headId: parsed.data.headId || null,
    },
  });

  if (parsed.data.headId) {
    await prisma.user.update({
      where: { id: parsed.data.headId },
      data: { departmentId: id },
    });
  }

  await ActivityAction.log(user.id, "DEPARTMENT_UPDATED", "Department", id);
  revalidatePath("/departments");
  revalidatePath(`/departments/${id}`);
  return { success: "Department updated" };
}

export async function deleteDepartment(id: string): Promise<DepartmentState> {
  const user = await requireAuth();
  if (user.role !== "ADMIN") return { error: "Only admins can delete departments" };

  const dept = await prisma.department.findUnique({
    where: { id },
    include: { children: true },
  });
  if (!dept) return { error: "Department not found" };
  if (dept.children.length > 0) {
    return { error: "Cannot delete department with child departments. Move or delete children first." };
  }

  await prisma.department.delete({ where: { id } });
  await ActivityAction.log(user.id, "DEPARTMENT_DELETED", "Department", id);
  revalidatePath("/departments");
  return { success: "Department deleted" };
}

async function wouldCreateCycle(parentId: string, excludeId: string | null): Promise<boolean> {
  let current = parentId;
  const visited = new Set<string>();
  while (current) {
    if (current === excludeId) return true;
    if (visited.has(current)) return true;
    visited.add(current);
    const d = await prisma.department.findUnique({ where: { id: current } });
    if (!d || !d.parentId) return false;
    current = d.parentId;
  }
  return false;
}