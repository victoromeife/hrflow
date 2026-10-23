// app/(dashboard)/messages/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { messageSchema } from "@/lib/validations";
import { ActivityAction } from "@/lib/activity";
import { ConversationType } from "@/app/generated/prisma";

export type MessageState = {
  error?: string;
  success?: string;
};

export async function sendMessage(
  _prev: MessageState = {},
  formData: FormData
): Promise<MessageState> {
  const user = await requireAuth();

  const raw = {
    conversationId: formData.get("conversationId") as string,
    content: formData.get("content") as string | undefined,
  };

  const parsed = messageSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const conversation = await prisma.conversation.findUnique({
    where: { id: parsed.data.conversationId },
    include: { participants: true },
  });
  if (!conversation) return { error: "Conversation not found" };

  const participant = conversation.participants.find((p) => p.userId === user.id);
  if (!participant) return { error: "Not a participant" };

  const message = await prisma.message.create({
    data: {
      conversationId: parsed.data.conversationId,
      senderId: user.id,
      content: parsed.data.content || null,
    },
  });

  await prisma.conversation.update({
    where: { id: parsed.data.conversationId },
    data: { updatedAt: new Date() },
  });

  await ActivityAction.log(user.id, "MESSAGE_SENT", "Message", message.id);
  revalidatePath("/messages");
  return { success: "Message sent" };
}

export async function createOrGetPrivateConversation(otherUserId: string): Promise<{ conversationId?: string; error?: string }> {
  const user = await requireAuth();
  if (user.id === otherUserId) return { error: "Cannot message yourself" };

  const other = await prisma.user.findUnique({ where: { id: otherUserId } });
  if (!other) return { error: "User not found" };

  // Find existing private conversation between these two users
  const existing = await prisma.conversation.findFirst({
    where: {
      type: ConversationType.PRIVATE,
      participants: {
        every: {
          userId: { in: [user.id, otherUserId] },
        },
      },
    },
    include: { participants: true },
  });

  if (existing && existing.participants.length === 2) {
    return { conversationId: existing.id };
  }

  const conversation = await prisma.conversation.create({
    data: {
      type: ConversationType.PRIVATE,
      participants: {
        create: [{ userId: user.id }, { userId: otherUserId }],
      },
    },
  });

  return { conversationId: conversation.id };
}

export async function createDepartmentConversation(
  departmentId: string,
  title?: string
): Promise<{ conversationId?: string; error?: string }> {
  const user = await requireAuth();
  const dept = await prisma.department.findUnique({ where: { id: departmentId } });
  if (!dept) return { error: "Department not found" };

  const conversation = await prisma.conversation.create({
    data: {
      type: ConversationType.DEPARTMENT,
      title: title || dept.name,
      participants: {
        create: { departmentId },
      },
    },
  });

  await ActivityAction.log(user.id, "CONVERSATION_CREATED", "Conversation", conversation.id);
  return { conversationId: conversation.id };
}