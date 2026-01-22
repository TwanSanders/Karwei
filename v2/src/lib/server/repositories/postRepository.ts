import { db } from '../db';
import { postsTable, usersTable } from '../db/schema';
import { eq, desc, sql, and, isNotNull, inArray, or, ilike } from 'drizzle-orm';
import type { Post } from '$lib/domain/types';

export class PostRepository {
  static async getAll(userLat?: number, userLong?: number, maxDistanceKm?: number, skillsFilter?: string[], searchQuery?: string): Promise<Post[]> {
    if (userLat && userLong) {
        const baseQuery = db.select({
            post: postsTable,
            distance: sql<number>`
                (6371 * acos(
                    cos(radians(${userLat})) * cos(radians(cast(${postsTable.lat} as double precision))) *
                    cos(radians(cast(${postsTable.long} as double precision)) - radians(${userLong})) +
                    sin(radians(${userLat})) * sin(radians(cast(${postsTable.lat} as double precision)))
                ))`.as('distance')
        }).from(postsTable).leftJoin(usersTable, eq(postsTable.userId, usersTable.id));

        const conditions = [];

        // Exclude closed posts from main feed
        conditions.push(sql`${postsTable.status} != 'closed'`);

        if (maxDistanceKm) {
             conditions.push(sql`(
                6371 * acos(
                    cos(radians(${userLat})) * cos(radians(cast(${postsTable.lat} as double precision))) *
                    cos(radians(cast(${postsTable.long} as double precision)) - radians(${userLong})) +
                    sin(radians(${userLat})) * sin(radians(cast(${postsTable.lat} as double precision)))
                )
            ) <= ${maxDistanceKm}`);
        }

        if (skillsFilter && skillsFilter.length > 0) {
            conditions.push(inArray(postsTable.type, skillsFilter));
        }

        if (searchQuery) {
            conditions.push(or(
                ilike(postsTable.title, `%${searchQuery}%`),
                ilike(postsTable.description, `%${searchQuery}%`),
                ilike(usersTable.name, `%${searchQuery}%`),
                ilike(usersTable.email, `%${searchQuery}%`)
            ));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const results = await baseQuery.where(whereClause).orderBy(sql`distance ASC`).limit(50);
        
        return results.map(row => ({
            id: row.post.id,
            userId: row.post.userId,
            title: row.post.title,
            imageUrl: row.post.imageUrl,
            description: row.post.description,
            purchasedAt: row.post.purchasedAt,
            type: row.post.type,
            targetPrice: row.post.targetPrice ? parseFloat(row.post.targetPrice) : null,
            makerId: row.post.makerId,
            status: row.post.status as 'open' | 'in_progress' | 'fixed' | 'closed',
            score: row.post.score ? parseFloat(row.post.score) : null,
            lat: row.post.lat ? parseFloat(row.post.lat) : null,
            long: row.post.long ? parseFloat(row.post.long) : null,
            createdAt: row.post.createdAt || new Date(),
            // @ts-ignore
            distance: row.distance
        }));
    }

    const query = db.select({ post: postsTable }).from(postsTable).leftJoin(usersTable, eq(postsTable.userId, usersTable.id))
        .where(sql`${postsTable.status} != 'closed'`);
    
    if (skillsFilter && skillsFilter.length > 0) {
        // @ts-ignore
        query.where(inArray(postsTable.type, skillsFilter));
    }

    if (searchQuery) {
        // @ts-ignore
        query.where(or(
            ilike(postsTable.title, `%${searchQuery}%`),
            ilike(postsTable.description, `%${searchQuery}%`),
            ilike(usersTable.name, `%${searchQuery}%`),
            ilike(usersTable.email, `%${searchQuery}%`)
        ));
    }

    const results = await query.orderBy(desc(postsTable.createdAt));
    
    return results.map(row => ({
      id: row.post.id,
      userId: row.post.userId,
      title: row.post.title,
      imageUrl: row.post.imageUrl,
      description: row.post.description,
      purchasedAt: row.post.purchasedAt,
      type: row.post.type,
      targetPrice: row.post.targetPrice ? parseFloat(row.post.targetPrice) : null,
      makerId: row.post.makerId,
      status: row.post.status as 'open' | 'in_progress' | 'fixed' | 'closed',
      score: row.post.score ? parseFloat(row.post.score) : null,
      lat: row.post.lat ? parseFloat(row.post.lat) : null,
      long: row.post.long ? parseFloat(row.post.long) : null,
      createdAt: row.post.createdAt || new Date(),
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

  static async findByMakerId(makerId: string): Promise<Post[]> {
    const results = await db.select().from(postsTable)
      .where(eq(postsTable.makerId, makerId))
      .orderBy(desc(postsTable.createdAt));
    
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

  static async getLatest(limit: number = 5): Promise<Post[]> {
    const results = await db.select().from(postsTable)
      .where(sql`${postsTable.status} != 'closed'`)
      .orderBy(desc(postsTable.createdAt))
      .limit(limit);
    
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
