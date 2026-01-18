import { db } from '../db';
import { postsTable } from '../db/schema';
import { eq, desc, sql, and, isNotNull } from 'drizzle-orm';
import type { Post } from '$lib/domain/types';

export class PostRepository {
  static async getAll(userLat?: number, userLong?: number, maxDistanceKm?: number): Promise<Post[]> {
    let query = db.select().from(postsTable);

    if (userLat && userLong) {
        // Use SQL for Haversine formula to sort by distance
        // 6371 is Earth's radius in km
        const distanceExpr = sql`
            6371 * acos(
                cos(radians(${userLat})) * cos(radians(${postsTable.lat})) *
                cos(radians(${postsTable.long}) - radians(${userLong})) +
                sin(radians(${userLat})) * sin(radians(${postsTable.lat}))
            )
        `;
        
        if (maxDistanceKm) {
             // We can't easily put this in WHERE clause with standard drizzle helpers without raw sql
             // So we might filter in memory or use a more complex where clause.
             // For now, let's just properly sort.
             // Actually, extending the query to return distance would be better.
        }
       
       // For simplicity in this iteration, let's fetch all and filter/sort in memory if dataset is small, 
       // OR use raw sql order by.
       // Given it's a prototype, let's do the raw SQL order by.
       
       return (await query.orderBy(distanceExpr)).map(row => ({
            id: row.id,
            userId: row.userId,
            title: row.title,
            imageUrl: row.imageUrl,
            description: row.description,
            purchasedAt: row.purchasedAt,
            type: row.type,
            targetPrice: row.targetPrice ? parseFloat(row.targetPrice) : null,
            makerId: row.makerId,
            status: row.status as 'open' | 'in_progress' | 'fixed' | 'closed',
            score: row.score ? parseFloat(row.score) : null,
            lat: row.lat ? parseFloat(row.lat) : null,
            long: row.long ? parseFloat(row.long) : null,
            createdAt: row.createdAt || new Date(),
       })).filter(post => {
           if (!maxDistanceKm || !post.lat || !post.long) return true;
           // Double check distance in memory
           const R = 6371; // km
           const dLat = (post.lat - userLat) * Math.PI / 180;
           const dLon = (post.long - userLong) * Math.PI / 180;
           const lat1 = userLat * Math.PI / 180;
           const lat2 = post.lat * Math.PI / 180;
           const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                   Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
           const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
           const d = R * c;
           return d <= maxDistanceKm;
       });
    }

    const results = await query.orderBy(desc(postsTable.createdAt));
    
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
      status: row.status as 'open' | 'in_progress' | 'fixed' | 'closed',
      score: row.score ? parseFloat(row.score) : null,
      lat: row.lat ? parseFloat(row.lat) : null,
      long: row.long ? parseFloat(row.long) : null,
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
      status: row.status as 'open' | 'in_progress' | 'fixed' | 'closed',
      score: row.score ? parseFloat(row.score) : null,
      lat: row.lat ? parseFloat(row.lat) : null,
      long: row.long ? parseFloat(row.long) : null,
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
      status: row.status as 'open' | 'in_progress' | 'fixed' | 'closed',
      score: row.score ? parseFloat(row.score) : null,
      lat: row.lat ? parseFloat(row.lat) : null,
      long: row.long ? parseFloat(row.long) : null,
      createdAt: row.createdAt || new Date(),
    };
  }
  static async findByUserId(userId: string): Promise<Post[]> {
    const results = await db.select().from(postsTable).where(eq(postsTable.userId, userId)).orderBy(desc(postsTable.createdAt));
    
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
      status: row.status as 'open' | 'in_progress' | 'fixed' | 'closed',
      score: row.score ? parseFloat(row.score) : null,
      lat: row.lat ? parseFloat(row.lat) : null,
      long: row.long ? parseFloat(row.long) : null,
      createdAt: row.createdAt || new Date(),
    }));
  }

  static async delete(id: string): Promise<void> {
    await db.delete(postsTable).where(eq(postsTable.id, id));
  }

  static async updateStatus(id: string, status: 'open' | 'in_progress' | 'fixed' | 'closed'): Promise<void> {
    await db.update(postsTable).set({ status }).where(eq(postsTable.id, id));
  }

  static async assignMaker(id: string, makerId: string): Promise<void> {
    await db.update(postsTable)
        .set({ 
            makerId, 
            status: 'in_progress' 
        })
        .where(eq(postsTable.id, id));
  }

  static async unassignMaker(id: string): Promise<void> {
    await db.update(postsTable)
        .set({ 
            makerId: null, 
            status: 'open' 
        })
        .where(eq(postsTable.id, id));
  }
  static async findAllOpenWithLocation(userLat?: number, userLong?: number, maxDistanceKm?: number): Promise<Post[]> {
    let query = db.select().from(postsTable)
        .where(
            and(
                eq(postsTable.status, 'open'),
                isNotNull(postsTable.lat),
                isNotNull(postsTable.long)
            )
        )
        .orderBy(desc(postsTable.createdAt));
    
    // If we have location data, we could sort by distance in SQL in the future.
    // For now, let's filter in memory as the dataset is likely small.
    
    let posts = (await query).map(row => ({
      id: row.id,
      userId: row.userId,
      title: row.title,
      imageUrl: row.imageUrl,
      description: row.description,
      purchasedAt: row.purchasedAt,
      type: row.type,
      targetPrice: row.targetPrice ? parseFloat(row.targetPrice) : null,
      makerId: row.makerId,
      status: row.status as 'open' | 'in_progress' | 'fixed' | 'closed',
      score: row.score ? parseFloat(row.score) : null,
      lat: row.lat ? parseFloat(row.lat) : null,
      long: row.long ? parseFloat(row.long) : null,
      createdAt: row.createdAt || new Date(),
    }));

    if (userLat && userLong && maxDistanceKm) {
        posts = posts.filter(post => {
            if (!post.lat || !post.long) return false;
            const R = 6371; // km
            const dLat = (post.lat - userLat) * Math.PI / 180;
            const dLon = (post.long - userLong) * Math.PI / 180;
            const lat1 = userLat * Math.PI / 180;
            const lat2 = post.lat * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
            const d = R * c;
            return d <= maxDistanceKm;
        });
    }

    return posts;
  }
}
