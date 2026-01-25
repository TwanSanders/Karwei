import { db } from '../db';
import { reviewsTable, usersTable } from '../db/schema';
import { eq, desc, avg, sql } from 'drizzle-orm';

export class ReviewRepository {
    static async create(reviewData: typeof reviewsTable.$inferInsert) {
        return await db.insert(reviewsTable).values(reviewData).returning();
    }

    static async getByTargetUserId(targetUserId: string) {
        return await db.select({
            id: reviewsTable.id,
            rating: reviewsTable.rating,
            comment: reviewsTable.comment,
            createdAt: reviewsTable.createdAt,
            reviewerName: usersTable.name,
            reviewerImage: usersTable.image,
            reviewerId: usersTable.id
        })
        .from(reviewsTable)
        .leftJoin(usersTable, eq(reviewsTable.reviewerId, usersTable.id))
        .where(eq(reviewsTable.targetUserId, targetUserId))
        .orderBy(desc(reviewsTable.createdAt));
    }

    static async getAverageRating(targetUserId: string): Promise<number | null> {
        const result = await db.select({
            average: avg(reviewsTable.rating)
        })
        .from(reviewsTable)
        .where(eq(reviewsTable.targetUserId, targetUserId));
        
        return result[0]?.average ? parseFloat(result[0].average) : null;
    }

    static async getByPostId(postId: string) {
        return await db.select({
            id: reviewsTable.id,
            rating: reviewsTable.rating,
            comment: reviewsTable.comment,
            createdAt: reviewsTable.createdAt,
            reviewerName: usersTable.name,
            reviewerImage: usersTable.image,
            reviewerId: usersTable.id,
            targetUserId: reviewsTable.targetUserId
        })
        .from(reviewsTable)
        .leftJoin(usersTable, eq(reviewsTable.reviewerId, usersTable.id))
        .where(eq(reviewsTable.postId, postId))
        .orderBy(desc(reviewsTable.createdAt));
    }
}
