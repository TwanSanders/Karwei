import { db } from '$lib/server/db';
import { notificationsTable, offersTable } from '$lib/server/db/schema';
import { desc, eq, and, sql } from 'drizzle-orm';

export const NotificationRepository = {
  async create(userId: string, type: 'offer' | 'accept' | 'contact_request', relatedId: string) {
    await db.insert(notificationsTable).values({
      userId,
      type,
      relatedId,
    });
  },

  async getByUser(userId: string) {
    const results = await db
        .select({
            id: notificationsTable.id,
            userId: notificationsTable.userId,
            type: notificationsTable.type,
            relatedId: notificationsTable.relatedId,
            read: notificationsTable.read,
            createdAt: notificationsTable.createdAt,
            postId: offersTable.postId
        })
        .from(notificationsTable)
        .leftJoin(offersTable, eq(notificationsTable.relatedId, offersTable.id))
        .where(eq(notificationsTable.userId, userId))
        .orderBy(desc(notificationsTable.createdAt));
    
    return results;
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
  }
};
