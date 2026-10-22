import { prisma } from "@/lib/prisma";

export const ActivityAction = {
  async log(actorId: string, action: string, entityType: string, entityId?: string) {
    await prisma.activity.create({
      data: { actorId, action, entityType, entityId },
    });
  },
};
