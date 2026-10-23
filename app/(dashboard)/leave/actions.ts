// app/(dashboard)/leave/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { canApproveLeave } from "@/lib/permissions";
import { leaveSchema } from "@/lib/validations";
import { ActivityAction } from "@/lib/activity";
import { LeaveStatus } from "@/app/generated/prisma";

export type LeaveState = {
  error?: string;
  success?: string;
};

export async function createLeaveRequest(
  _prev: LeaveState = {},
  formData: FormData
): Promise<LeaveState> {
  const user = await requireAuth();

  const raw = {
    leaveType: formData.get("leaveType") as string,
    startDate: formData.get("startDate") as string,
    endDate: formData.get("endDate") as string,
    reason: formData.get("reason") as string,
  };

  const parsed = leaveSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const start = new Date(parsed.data.startDate);
  const end = new Date(parsed.data.endDate);
  if (start >= end) return { error: "End date must be after start date" };
  if (start < new Date()) return { error: "Start date cannot be in the past" };

  // Check for overlapping approved leave
  const overlapping = await prisma.leaveRequest.findFirst({
    where: {
      userId: user.id,
      status: LeaveStatus.APPROVED,
      startDate: { lte: end },
      endDate: { gte: start },
    },
  });
  if (overlapping) return { error: "You already have approved leave during this period" };

  const leave = await prisma.leaveRequest.create({
    data: {
      userId: user.id,
      leaveType: parsed.data.leaveType as any,
      startDate: start,
      endDate: end,
      reason: parsed.data.reason,
      status: LeaveStatus.PENDING,
    },
  });

  await ActivityAction.log(user.id, "LEAVE_REQUESTED", "LeaveRequest", leave.id);
  revalidatePath("/leave");
  return { success: "Leave request submitted" };
}

export async function approveLeaveRequest(id: string): Promise<LeaveState> {
  const user = await requireAuth();
  if (!canApproveLeave(user)) return { error: "Not authorized" };

  const leave = await prisma.leaveRequest.findUnique({ where: { id } });
  if (!leave) return { error: "Leave request not found" };
  if (leave.status !== LeaveStatus.PENDING) return { error: "Only pending requests can be approved" };

  await prisma.leaveRequest.update({
    where: { id },
    data: { status: LeaveStatus.APPROVED, reviewedById: user.id, reviewedAt: new Date() },
  });

  await ActivityAction.log(user.id, "LEAVE_APPROVED", "LeaveRequest", id);
  revalidatePath("/leave");
  return { success: "Leave approved" };
}

export async function rejectLeaveRequest(id: string, note?: string): Promise<LeaveState> {
  const user = await requireAuth();
  if (!canApproveLeave(user)) return { error: "Not authorized" };

  const leave = await prisma.leaveRequest.findUnique({ where: { id } });
  if (!leave) return { error: "Leave request not found" };
  if (leave.status !== LeaveStatus.PENDING) return { error: "Only pending requests can be rejected" };

  await prisma.leaveRequest.update({
    where: { id },
    data: { status: LeaveStatus.REJECTED, reviewedById: user.id, reviewedAt: new Date(), reviewNote: note || null },
  });

  await ActivityAction.log(user.id, "LEAVE_REJECTED", "LeaveRequest", id);
  revalidatePath("/leave");
  return { success: "Leave rejected" };
}

export async function cancelLeaveRequest(id: string): Promise<LeaveState> {
  const user = await requireAuth();
  const leave = await prisma.leaveRequest.findUnique({ where: { id } });
  if (!leave) return { error: "Leave request not found" };
  if (leave.userId !== user.id) return { error: "Not authorized" };
  if (leave.status !== LeaveStatus.PENDING) return { error: "Only pending requests can be cancelled" };

  await prisma.leaveRequest.update({
    where: { id },
    data: { status: LeaveStatus.CANCELLED },
  });

  await ActivityAction.log(user.id, "LEAVE_CANCELLED", "LeaveRequest", id);
  revalidatePath("/leave");
  return { success: "Leave cancelled" };
}