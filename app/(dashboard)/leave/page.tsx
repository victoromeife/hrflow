// app/(dashboard)/leave/page.tsx
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canApproveLeave } from "@/lib/permissions";
import { LeaveClient } from "@/components/leave/leave-client";

export default async function LeavePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const canApprove = canApproveLeave(user);

  const [requests, pending] = await Promise.all([
    prisma.leaveRequest.findMany({
      where: canApprove ? {} : { userId: user.id },
      include: { user: true, reviewedBy: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.leaveRequest.count({ where: { status: "PENDING" } }),
  ]);

  return <LeaveClient user={user} requests={requests} pendingCount={pending} canApprove={canApprove} />;
}