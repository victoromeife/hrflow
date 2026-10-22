// app/(dashboard)/attendance/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { ActivityAction } from "@/lib/activity";

export type AttendanceState = {
  error?: string;
  success?: string;
};

export async function clockIn(): Promise<AttendanceState> {
  const user = await requireAuth();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await prisma.attendance.findUnique({
    where: { userId_date: { userId: user.id, date: today } },
  });
  if (existing && existing.clockIn) {
    return { error: "You have already clocked in today" };
  }

  const now = new Date();
  await prisma.attendance.upsert({
    where: { userId_date: { userId: user.id, date: today } },
    update: { clockIn: now },
    create: { userId: user.id, date: today, clockIn: now, status: "PRESENT" },
  });

  await ActivityAction.log(user.id, "ATTENDANCE_CLOCK_IN", "Attendance");
  revalidatePath("/attendance");
  return { success: "Clocked in" };
}

export async function clockOut(): Promise<AttendanceState> {
  const user = await requireAuth();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const record = await prisma.attendance.findUnique({
    where: { userId_date: { userId: user.id, date: today } },
  });
  if (!record || !record.clockIn) {
    return { error: "You have not clocked in yet" };
  }
  if (record.clockOut) {
    return { error: "You have already clocked out" };
  }
  if (new Date() <= record.clockIn) {
    return { error: "Invalid clock out time" };
  }

  await prisma.attendance.update({
    where: { id: record.id },
    data: { clockOut: new Date() },
  });

  await ActivityAction.log(user.id, "ATTENDANCE_CLOCK_OUT", "Attendance");
  revalidatePath("/attendance");
  return { success: "Clocked out" };
}