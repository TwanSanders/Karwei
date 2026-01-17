import { db } from '../db';
import { offersTable } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import type { Offer } from '$lib/domain/types';

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

  static async delete(id: string): Promise<void> {
    await db.delete(offersTable).where(eq(offersTable.id, id));
  }
}
