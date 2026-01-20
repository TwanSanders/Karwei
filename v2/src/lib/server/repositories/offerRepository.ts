import { db } from '../db';
import { offersTable, postsTable } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';
import type { Offer } from '$lib/domain/types';
import { NotificationRepository } from './notificationRepository';

export class OfferRepository {
  static async getByPostId(postId: string): Promise<Offer[]> {
    const results = await db.select().from(offersTable).where(eq(offersTable.postId, postId)).orderBy(desc(offersTable.createdAt));
    
    return results.map(row => ({
      id: row.id,
      userId: row.userId,
      postId: row.postId,
      makerId: row.makerId,
      message: row.message,
      price: row.price ? parseFloat(row.price) : null,
      createdAt: row.createdAt || new Date(),
    }));
  }

  static async create(offerData: typeof offersTable.$inferInsert): Promise<Offer> {
    const result = await db.insert(offersTable).values(offerData).returning();
    const row = result[0];

    // Trigger Notification for the Post Owner
    // We need to fetch the post to get the user ID using a separate query or join, 
    // but for now let's assume we can get it or just do a quick lookup.
    // OfferData has postId.
    try {
        const post = await db.select().from(postsTable).where(eq(postsTable.id, offerData.postId)).then(res => res[0]);
        if (post) {
            await NotificationRepository.create(post.userId, 'offer', row.id);
        }
    } catch (e) {
        console.error("Failed to send notification", e);
    }

    return {
      id: row.id,
      userId: row.userId,
      postId: row.postId,
      makerId: row.makerId,
      message: row.message,
      price: row.price ? parseFloat(row.price) : null,
      createdAt: row.createdAt || new Date(),
    };
  }

  static async getByMakerId(makerId: string): Promise<Offer[]> {
    const results = await db.select().from(offersTable).where(eq(offersTable.makerId, makerId)).orderBy(desc(offersTable.createdAt));
    
    return results.map(row => ({
      id: row.id,
      userId: row.userId,
      postId: row.postId,
      makerId: row.makerId,
      message: row.message,
      price: row.price ? parseFloat(row.price) : null,
      createdAt: row.createdAt || new Date(),
    }));
  }

  static async getByUserAndPost(makerId: string, postId: string): Promise<Offer | null> {
    const results = await db.select().from(offersTable)
        .where(and(eq(offersTable.makerId, makerId), eq(offersTable.postId, postId)));
    
    if (results.length === 0) return null;
    const row = results[0];
    return {
      id: row.id,
      userId: row.userId,
      postId: row.postId,
      makerId: row.makerId,
      message: row.message,
      price: row.price ? parseFloat(row.price) : null,
      createdAt: row.createdAt || new Date(),
    };
  }

  static async update(id: string, data: { message: string, price?: string }): Promise<void> {
    await db.update(offersTable)
        .set(data)
        .where(eq(offersTable.id, id));
  }

  static async delete(id: string): Promise<void> {
    await db.delete(offersTable).where(eq(offersTable.id, id));
  }
}
