import { db } from '../db';
import { commentsTable } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import type { Comment } from '$lib/domain/types';

export class CommentRepository {
  static async getByPostId(postId: string): Promise<Comment[]> {
    const results = await db.select().from(commentsTable).where(eq(commentsTable.postId, postId)).orderBy(desc(commentsTable.createdAt));
    
    return results.map(row => ({
      id: row.id,
      userId: row.userId,
      postId: row.postId,
      message: row.message,
      imageUrl: row.imageUrl,
      createdAt: row.createdAt || new Date(),
    }));
  }

  static async create(commentData: typeof commentsTable.$inferInsert): Promise<Comment> {
    const result = await db.insert(commentsTable).values(commentData).returning();
    const row = result[0];
    return {
      id: row.id,
      userId: row.userId,
      postId: row.postId,
      message: row.message,
      imageUrl: row.imageUrl,
      createdAt: row.createdAt || new Date(),
    };
  }
}
