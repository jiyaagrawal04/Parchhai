import { prisma } from "../lib/prisma.js";

/** Record an admin mutation for the audit trail. Fire-and-forget safe. */
export const recordAudit = async (
  actorId: string | undefined,
  action: string,
  entity: string,
  before?: unknown,
  after?: unknown,
) => {
  await prisma.auditLog
    .create({
      data: {
        actorId: actorId ?? null,
        action,
        entity,
        before: (before ?? undefined) as never,
        after: (after ?? undefined) as never,
      },
    })
    .catch(() => undefined);
};
