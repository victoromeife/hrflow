// app/(dashboard)/messages/page.tsx
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageEmployees } from "@/lib/permissions";
import { MessagesClient } from "@/components/messages/messages-client";

export default async function MessagesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [conversations, users, departments] = await Promise.all([
    prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId: user.id },
        },
      },
      include: {
        participants: { include: { user: true, department: true } },
        messages: {
          include: { sender: true, attachments: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
    canManageEmployees(user)
      ? prisma.user.findMany({ where: { employmentStatus: "ACTIVE" }, select: { id: true, fullName: true, email: true } })
      : prisma.user.findMany({ where: { id: user.id }, select: { id: true, fullName: true, email: true } }),
    prisma.department.findMany({ select: { id: true, name: true } }),
  ]);

  return <MessagesClient user={user} conversations={conversations} users={users} departments={departments} />;
}