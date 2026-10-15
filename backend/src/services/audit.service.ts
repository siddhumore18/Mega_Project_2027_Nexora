import { prisma } from "../db/prisma.js";

export interface CreateAuditEntry {
  actorId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  correlationId: string;
  payload?: any;
}

export async function logAuditEvent(entry: CreateAuditEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: entry.actorId ?? null,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId ?? null,
        correlationId: entry.correlationId,
        payload: entry.payload ? JSON.parse(JSON.stringify(entry.payload)) : undefined,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "test" && (error as any)?.name !== "PrismaClientInitializationError") {
      console.error("[AuditLog Error]", error);
    }
  }
}
