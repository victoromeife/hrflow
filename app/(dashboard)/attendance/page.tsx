// app/(dashboard)/attendance/page.tsx
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canViewAllAttendance } from "@/lib/permissions";
import { AttendanceClient } from "@/components/attendance/attendance-client";

export default async function AttendancePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const canViewAll = canViewAllAttendance(user);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [records, presentToday] = await Promise.all([
    prisma.attendance.findMany({
      where: canViewAll ? {} : { userId: user.id },
      include: { user: true },
      orderBy: { date: "desc" },
      take: 50,
    }),
    prisma.attendance.count({
      where: { date: today, clockIn: { not: null } },
    }),
  ]);

  const todayRecord = await prisma.attendance.findUnique({
    where: { userId_date: { userId: user.id, date: today } },
  });

  return <AttendanceClient user={user} records={records} presentToday={presentToday} todayRecord={todayRecord} canViewAll={canViewAll} />;
}