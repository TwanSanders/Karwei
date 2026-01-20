import { db } from '$lib/server/db';
import { notificationsTable, offersTable, contactRequestsTable, usersTable } from '$lib/server/db/schema';
import { desc, eq, and, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

export const NotificationRepository = {
  async create(userId: string, type: 'offer' | 'accept' | 'contact_request' | 'unassign', relatedId: string) {
    await db.insert(notificationsTable).values({
      userId,
      type,
      relatedId,
    });
  },

  async getByUser(userId: string, onlyUnread: boolean = false) {
    const requesters = alias(usersTable, "requester");
    const targets = alias(usersTable, "target");

    const baseQuery = db
        .select({
            id: notificationsTable.id,
            userId: notificationsTable.userId,
            type: notificationsTable.type,
            relatedId: notificationsTable.relatedId,
            read: notificationsTable.read,
            createdAt: notificationsTable.createdAt,
            postId: offersTable.postId,
            contactTargetUserId: contactRequestsTable.targetUserId,
            contactRequesterId: contactRequestsTable.requesterId,
            contactStatus: contactRequestsTable.status,
            requesterName: requesters.name,
            targetName: targets.name
        })
        .from(notificationsTable)
        .leftJoin(offersTable, eq(notificationsTable.relatedId, offersTable.id))
        .leftJoin(contactRequestsTable, eq(notificationsTable.relatedId, contactRequestsTable.id))
        .leftJoin(requesters, eq(contactRequestsTable.requesterId, requesters.id))
        .leftJoin(targets, eq(contactRequestsTable.targetUserId, targets.id));

    const conditions = [eq(notificationsTable.userId, userId)];
    if (onlyUnread) {
        conditions.push(eq(notificationsTable.read, false));
    }

    const results = await baseQuery
        .where(and(...conditions))
        .orderBy(desc(notificationsTable.createdAt));
    
    return results;
  },

  async getById(id: string) {
    const requesters = alias(usersTable, "requester");
    const targets = alias(usersTable, "target");

    const result = await db
        .select({
            id: notificationsTable.id,
            userId: notificationsTable.userId,
            type: notificationsTable.type,
            relatedId: notificationsTable.relatedId,
            read: notificationsTable.read,
            createdAt: notificationsTable.createdAt,
            postId: offersTable.postId,
            contactTargetUserId: contactRequestsTable.targetUserId,
            contactRequesterId: contactRequestsTable.requesterId,
            contactStatus: contactRequestsTable.status,
            requesterName: requesters.name,
            targetName: targets.name
        })
        .from(notificationsTable)
        .leftJoin(offersTable, eq(notificationsTable.relatedId, offersTable.id))
        .leftJoin(contactRequestsTable, eq(notificationsTable.relatedId, contactRequestsTable.id))
        .leftJoin(requesters, eq(contactRequestsTable.requesterId, requesters.id))
        .leftJoin(targets, eq(contactRequestsTable.targetUserId, targets.id))
        .where(eq(notificationsTable.id, id));
    
    return result[0];
  },

  async markAsRead(notificationId: string) {
    await db.update(notificationsTable).set({ read: true }).where(eq(notificationsTable.id, notificationId));
  },

  async markAllAsRead(userId: string) {
    await db.update(notificationsTable)
        .set({ read: true })
        .where(
            and(
                eq(notificationsTable.userId, userId),
                eq(notificationsTable.read, false)
            )
        );
  },

  async getUnreadCount(userId: string) {
    const result = await db.select({ count: sql`count(*)` })
        .from(notificationsTable)
        .where(
            and(
                eq(notificationsTable.userId, userId),
                eq(notificationsTable.read, false)
            )
        );
    return parseInt(result[0].count as string);
  },

  async delete(id: string) {
    await db.delete(notificationsTable).where(eq(notificationsTable.id, id));
  }
};
