import { db } from '../db';
import { usersTable, postsTable, reviewsTable } from '../db/schema';
import { eq, sql, and, or, ilike, count } from 'drizzle-orm';
import type { User } from '$lib/domain/types';
import { ReviewRepository } from './reviewRepository';

export class UserRepository {
  static async findByEmail(email: string): Promise<User | null> {
    const result = await db.select().from(usersTable).where(eq(usersTable.email, email));
    
    if (result.length === 0) return null;
    
    const row = result[0];
    const completedRepairs = await UserRepository.countCompletedRepairs(row.id);
    const level = UserRepository.calculateLevel(completedRepairs);

    return {
      id: row.id,
      name: row.name,
      email: row.email,
      image: row.image,
      skills: row.skills,
      lat: row.lat ? parseFloat(row.lat) : null,
      long: row.long ? parseFloat(row.long) : null,
      bio: row.bio,
      maker: row.maker || false,
      createdAt: row.createdAt || new Date(),
      phoneNumber: row.phoneNumber,
      completedRepairs,
      level
    };
  }
  
  static async getById(id: string): Promise<User | null> {
    const result = await db.select().from(usersTable).where(eq(usersTable.id, id));
    
    if (result.length === 0) return null;
    
    const row = result[0];
    const completedRepairs = await UserRepository.countCompletedRepairs(row.id);
    const level = UserRepository.calculateLevel(completedRepairs);
    
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      image: row.image,
      skills: row.skills,
      lat: row.lat ? parseFloat(row.lat) : null,
      long: row.long ? parseFloat(row.long) : null,
      bio: row.bio,
      maker: row.maker || false,
      createdAt: row.createdAt || new Date(),
      phoneNumber: row.phoneNumber,
      completedRepairs,
      level
    };
  }

  static async create(userData: typeof usersTable.$inferInsert): Promise<User> {
    const result = await db.insert(usersTable).values(userData).returning();
    const row = result[0];
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phoneNumber: row.phoneNumber,
      image: row.image,
      skills: row.skills,
      lat: row.lat ? parseFloat(row.lat) : null,
      long: row.long ? parseFloat(row.long) : null,
      bio: row.bio,
      maker: row.maker || false,
      createdAt: row.createdAt || new Date(),
    };
  }

  static async update(id: string, userData: Partial<typeof usersTable.$inferInsert>): Promise<User | null> {
    const result = await db.update(usersTable).set(userData).where(eq(usersTable.id, id)).returning();
    
    if (result.length === 0) return null;

    const row = result[0];
    return {
        id: row.id,
        name: row.name,
        email: row.email,
        image: row.image,
        skills: row.skills,
        lat: row.lat ? parseFloat(row.lat) : null,
        long: row.long ? parseFloat(row.long) : null,
        bio: row.bio,
        maker: row.maker || false,
        createdAt: row.createdAt || new Date(),
        phoneNumber: row.phoneNumber,
    };
  }
  
  // Necessary for auth verification to get password hash separately
  static async findByEmailWithPassword(email: string): Promise<{user: User, passwordHash: string} | null> {
    const result = await db.select().from(usersTable).where(eq(usersTable.email, email));
    
    if (result.length === 0) return null;
    
    const row = result[0];
    const user: User = {
      id: row.id,
      name: row.name,
      email: row.email,
      image: row.image,
      skills: row.skills,
      lat: row.lat ? parseFloat(row.lat) : null,
      long: row.long ? parseFloat(row.long) : null,
      bio: row.bio,
      maker: row.maker || false,
      createdAt: row.createdAt || new Date(),
      phoneNumber: row.phoneNumber,
    };
    
    return { user, passwordHash: row.passwordHash };
  }
  static async getMakers(userLat?: number, userLong?: number, maxDistanceKm?: number, skillsFilter?: string[], searchQuery?: string): Promise<User[]> {
     if (userLat && userLong) {
        let whereConditions = eq(usersTable.maker, true);
        
        let distanceExpr = sql<number>`
            (6371 * acos(
                cos(radians(${userLat})) * cos(radians(cast(${usersTable.lat} as double precision))) *
                cos(radians(cast(${usersTable.long} as double precision)) - radians(${userLong})) +
                sin(radians(${userLat})) * sin(radians(cast(${usersTable.lat} as double precision)))
            ))`;
            
        let distanceClause = undefined;
        if (maxDistanceKm) {
             distanceClause = sql`(
                6371 * acos(
                    cos(radians(${userLat})) * cos(radians(cast(${usersTable.lat} as double precision))) *
                    cos(radians(cast(${usersTable.long} as double precision)) - radians(${userLong})) +
                    sin(radians(${userLat})) * sin(radians(cast(${usersTable.lat} as double precision)))
                )
            ) <= ${maxDistanceKm}`;
        }

        const baseQuery = db.select({
            user: usersTable,
            distance: distanceExpr.as('distance')
        }).from(usersTable);

        // Combine where conditions
        let finalWhere: any = whereConditions;
        if (distanceClause) {
            finalWhere = and(whereConditions, distanceClause);
        }

        if (searchQuery) {
            finalWhere = and(finalWhere, or(
                ilike(usersTable.name, `%${searchQuery}%`),
                ilike(usersTable.email, `%${searchQuery}%`)
            ));
        }

        const results = await baseQuery.where(finalWhere).orderBy(sql`distance ASC`).limit(50);

        let makers = results.map(row => ({
            id: row.user.id,
            name: row.user.name,
            email: row.user.email,
            image: row.user.image,
            skills: row.user.skills,
            lat: row.user.lat ? parseFloat(row.user.lat) : null,
            long: row.user.long ? parseFloat(row.user.long) : null,
            bio: row.user.bio,
            maker: row.user.maker || false,
            createdAt: row.user.createdAt || new Date(),
            phoneNumber: row.user.phoneNumber,
            // @ts-ignore
            distance: row.distance
        }));

        // Enhance with levels and ratings
        const makersWithExtras = await Promise.all(makers.map(async maker => {
            const completedRepairs = await UserRepository.countCompletedRepairs(maker.id);
            const level = UserRepository.calculateLevel(completedRepairs);
            const averageRating = await ReviewRepository.getAverageRating(maker.id);
            return { ...maker, completedRepairs, level, averageRating };
        }));
        
        makers = makersWithExtras;

        // Filter by skills if provided (still in memory for now as skills are comma-separated string)
        if (skillsFilter && skillsFilter.length > 0) {
            makers = makers.filter(maker => {
                if (!maker.skills) return false;
                const makerSkills = maker.skills.split(',').map(s => s.trim().toLowerCase());
                return skillsFilter.some(skill => makerSkills.includes(skill.toLowerCase()));
            });
        }
        
        return makers;
     }
     
     // Fallback if no location provided
     let where = eq(usersTable.maker, true);
     
     if (searchQuery) {
        // @ts-ignore
         where = and(where, or(
             ilike(usersTable.name, `%${searchQuery}%`),
             ilike(usersTable.email, `%${searchQuery}%`)
         ));
     }
     
     const results = await db.select().from(usersTable).where(where);
     
     // Enhance with levels and ratings
     const makersWithExtras = await Promise.all(results.map(async row => {
        const completedRepairs = await UserRepository.countCompletedRepairs(row.id);
        const level = UserRepository.calculateLevel(completedRepairs);
        const averageRating = await ReviewRepository.getAverageRating(row.id);
        return {
            id: row.id,
            name: row.name,
            email: row.email,
            image: row.image,
            skills: row.skills,
            lat: row.lat ? parseFloat(row.lat) : null,
            long: row.long ? parseFloat(row.long) : null,
            bio: row.bio,
            maker: row.maker || false,
            createdAt: row.createdAt || new Date(),
            phoneNumber: row.phoneNumber,
            completedRepairs,
            level,
            averageRating
        };
     }));
     
     let makers = makersWithExtras;


        // Filter by skills if provided (still in memory for now as skills are comma-separated string)
        if (skillsFilter && skillsFilter.length > 0) {
            makers = makers.filter(maker => {
                if (!maker.skills) return false;
                const makerSkills = maker.skills.split(',').map(s => s.trim().toLowerCase());
                return skillsFilter.some(skill => makerSkills.includes(skill.toLowerCase()));
            });
        }
     
     return makers;
  }

  static async countCompletedRepairs(userId: string): Promise<number> {
      // Count reviews received by the user (as a maker)
      // This is more reliable than counting 'fixed' posts since reviews indicate actual completed work
      const result = await db.select({ count: count() })
        .from(reviewsTable)
        .where(eq(reviewsTable.targetUserId, userId));
      return result[0].count;
  }

  static calculateLevel(completedRepairs: number): 'novice' | 'handyman' | 'master' {
      if (completedRepairs >= 21) return 'master';
      if (completedRepairs >= 6) return 'handyman';
      return 'novice';
  }
}
