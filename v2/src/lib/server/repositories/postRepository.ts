import { db } from '../db';
import { postsTable } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import type { Post } from '$lib/domain/types';

export class PostRepository {
  static async getAll(): Promise<Post[]> {
    const results = await db.select().from(postsTable).orderBy(desc(postsTable.createdAt));
    
    return results.map(row => ({
      id: row.id,
      userId: row.userId,
      title: row.title,
      imageUrl: row.imageUrl,
      description: row.description,
      purchasedAt: row.purchasedAt,
      type: row.type,
      targetPrice: row.targetPrice ? parseFloat(row.targetPrice) : null,
      makerId: row.makerId,
      score: row.score ? parseFloat(row.score) : null,
      createdAt: row.createdAt || new Date(),
    }));
  }

  static async getById(id: string): Promise<Post | null> {
    const result = await db.select().from(postsTable).where(eq(postsTable.id, id));
    
    if (result.length === 0) return null;
    
    const row = result[0];
    return {
      id: row.id,
      userId: row.userId,
      title: row.title,
      imageUrl: row.imageUrl,
      description: row.description,
      purchasedAt: row.purchasedAt,
      type: row.type,
      targetPrice: row.targetPrice ? parseFloat(row.targetPrice) : null,
      makerId: row.makerId,
      score: row.score ? parseFloat(row.score) : null,
      createdAt: row.createdAt || new Date(),
    };
  }

  static async create(postData: typeof postsTable.$inferInsert): Promise<Post> {
    const result = await db.insert(postsTable).values(postData).returning();
    const row = result[0];
    return {
      id: row.id,
      userId: row.userId,
      title: row.title,
      imageUrl: row.imageUrl,
      description: row.description,
      purchasedAt: row.purchasedAt,
      type: row.type,
      targetPrice: row.targetPrice ? parseFloat(row.targetPrice) : null,
      makerId: row.makerId,
      score: row.score ? parseFloat(row.score) : null,
      createdAt: row.createdAt || new Date(),
    };
  }
}
