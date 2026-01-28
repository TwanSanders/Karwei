import { db } from '../db';
import { usersTable, postsTable, reviewsTable, usersToSkillsTable, skillsTable } from '../db/schema';
import { eq, sql, and, or, ilike, count, inArray, exists, type SQL } from 'drizzle-orm';
import type { User, Skill } from '$lib/domain/types';
import { ReviewRepository } from './reviewRepository';

export class UserRepository {
  
  // Helper function to fetch user skills from junction table
  private static async getUserSkills(userId: string): Promise<Skill[]> {
    const results = await db
      .select({ skill: skillsTable })
      .from(usersToSkillsTable)
      .innerJoin(skillsTable, eq(usersToSkillsTable.skillId, skillsTable.id))
      .where(eq(usersToSkillsTable.userId, userId))
      .orderBy(skillsTable.displayOrder);
    
    return results.map(r => ({
      id: r.skill.id,
      name: r.skill.name,
      category: r.skill.category,
      description: r.skill.description,
      icon: r.skill.icon,
      displayOrder: r.skill.displayOrder,
      active: r.skill.active || false,
      createdAt: r.skill.createdAt || new Date()
    }));
  }
  
  static async findByEmail(email: string): Promise<User | null> {
    const result = await db.select().from(usersTable).where(eq(usersTable.email, email));
    
    if (result.length === 0) return null;
    
    const row = result[0];
    const skills = await UserRepository.getUserSkills(row.id);
    const completedRepairs = await UserRepository.countCompletedRepairs(row.id);
    const level = UserRepository.calculateLevel(completedRepairs);

    return {
      id: row.id,
      name: row.name,
      email: row.email,
      image: row.image,
      skills,
      lat: row.lat ? parseFloat(row.lat) : null,
      long: row.long ? parseFloat(row.long) : null,
      bio: row.bio,
      makerBio: row.makerBio,
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
    const skills = await UserRepository.getUserSkills(row.id);
    const completedRepairs = await UserRepository.countCompletedRepairs(row.id);
    const level = UserRepository.calculateLevel(completedRepairs);
    
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      image: row.image,
      skills,
      lat: row.lat ? parseFloat(row.lat) : null,
      long: row.long ? parseFloat(row.long) : null,
      bio: row.bio,
      makerBio: row.makerBio,
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
    // New users have no skills initially
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phoneNumber: row.phoneNumber,
      image: row.image,
      skills: [],
      lat: row.lat ? parseFloat(row.lat) : null,
      long: row.long ? parseFloat(row.long) : null,
      bio: row.bio,
      makerBio: row.makerBio,
      maker: row.maker || false,
      createdAt: row.createdAt || new Date(),
    };
  }

  static async update(id: string, userData: Partial<typeof usersTable.$inferInsert>): Promise<User | null> {
    const result = await db.update(usersTable).set(userData).where(eq(usersTable.id, id)).returning();
    
    if (result.length === 0) return null;

    const row = result[0];
    const skills = await UserRepository.getUserSkills(row.id);
    return {
        id: row.id,
        name: row.name,
        email: row.email,
        image: row.image,
        skills,
        lat: row.lat ? parseFloat(row.lat) : null,
        long: row.long ? parseFloat(row.long) : null,
        bio: row.bio,
        makerBio: row.makerBio,
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
    const skills = await UserRepository.getUserSkills(row.id);
    const user: User = {
      id: row.id,
      name: row.name,
      email: row.email,
      image: row.image,
      skills,
      lat: row.lat ? parseFloat(row.lat) : null,
      long: row.long ? parseFloat(row.long) : null,
      bio: row.bio,
      makerBio: row.makerBio,
      maker: row.maker || false,
      createdAt: row.createdAt || new Date(),
      phoneNumber: row.phoneNumber,
    };
    
    return { user, passwordHash: row.passwordHash };
  }
  static async getMakers(userLat?: number, userLong?: number, maxDistanceKm?: number, skillsFilter?: string[], searchQuery?: string): Promise<User[]> {
     // Prepare base WHERE conditions
     let whereConditions: SQL = eq(usersTable.maker, true);
     
     if (searchQuery) {
         // @ts-ignore
         whereConditions = and(whereConditions, or(
             ilike(usersTable.name, `%${searchQuery}%`),
             ilike(usersTable.email, `%${searchQuery}%`)
         ));
     }

     // Filter by skills using EXISTS subquery (at DB level)
     if (skillsFilter && skillsFilter.length > 0) {
        whereConditions = and(whereConditions, exists(
            db.select()
              .from(usersToSkillsTable)
              .where(and(
                  eq(usersToSkillsTable.userId, usersTable.id),
                  inArray(usersToSkillsTable.skillId, skillsFilter)
              ))
        ))!;
     }

     let results;

     if (userLat && userLong) {
        let distanceExpr = sql<number>`
            (6371 * acos(
                cos(radians(${userLat})) * cos(radians(cast(${usersTable.lat} as double precision))) *
                cos(radians(cast(${usersTable.long} as double precision)) - radians(${userLong})) +
                sin(radians(${userLat})) * sin(radians(cast(${usersTable.lat} as double precision)))
            ))`;
            
        let distanceClause: SQL | undefined;
        if (maxDistanceKm) {
             distanceClause = sql`(
                6371 * acos(
                    cos(radians(${userLat})) * cos(radians(cast(${usersTable.lat} as double precision))) *
                    cos(radians(cast(${usersTable.long} as double precision)) - radians(${userLong})) +
                    sin(radians(${userLat})) * sin(radians(cast(${usersTable.lat} as double precision)))
                )
            ) <= ${maxDistanceKm}`;
        }

        // Combine where conditions
        let finalWhere: SQL = whereConditions;
        if (distanceClause) {
            finalWhere = and(whereConditions, distanceClause!)!;
        }

        // Optimized query with JOIN for stats
        results = await db.select({
            user: usersTable,
            distance: distanceExpr.as('distance'),
            avgRating: sql<number>`AVG(CAST(${reviewsTable.rating} AS DECIMAL))`.as('avg_rating'),
            reviewCount: count(reviewsTable.id).as('review_count')
        })
        .from(usersTable)
        .leftJoin(reviewsTable, eq(usersTable.id, reviewsTable.targetUserId))
        .where(finalWhere)
        .groupBy(usersTable.id) // Works because functional dependency on ID
        .orderBy(sql`distance ASC`)
        .limit(50);

     } else {
         // Fallback if no location provided
         // Note: We might want to limit this too, but preserving original behavior (no limit?) 
         // but adding the stats fetching
         
         results = await db.select({
            user: usersTable,
            distance: sql<number>`0`.as('distance'), // Dummy distance
            avgRating: sql<number>`AVG(CAST(${reviewsTable.rating} AS DECIMAL))`.as('avg_rating'),
            reviewCount: count(reviewsTable.id).as('review_count')
         })
         .from(usersTable)
         .leftJoin(reviewsTable, eq(usersTable.id, reviewsTable.targetUserId))
         .where(whereConditions)
         .groupBy(usersTable.id);
     }
     
     // Extract user IDs for batch operations
     const userIds = results.map(row => row.user.id);
     
     // Batch fetch skills for all users (O(1) query)
     const skillsByUserId = new Map<string, Skill[]>();
     if (userIds.length > 0) {
         const skillsResults = await db
             .select({
                 userId: usersToSkillsTable.userId,
                 skill: skillsTable
             })
             .from(usersToSkillsTable)
             .innerJoin(skillsTable, eq(usersToSkillsTable.skillId, skillsTable.id))
             .where(inArray(usersToSkillsTable.userId, userIds))
             .orderBy(skillsTable.displayOrder);
         
         skillsResults.forEach(row => {
             if (!skillsByUserId.has(row.userId)) {
                 skillsByUserId.set(row.userId, []);
             }
             skillsByUserId.get(row.userId)!.push({
                 id: row.skill.id,
                 name: row.skill.name,
                 category: row.skill.category,
                 description: row.skill.description,
                 icon: row.skill.icon,
                 displayOrder: row.skill.displayOrder,
                 active: row.skill.active || false,
                 createdAt: row.skill.createdAt || new Date()
             });
         });
     }

     return results.map(row => ({
         id: row.user.id,
         name: row.user.name,
         email: row.user.email,
         image: row.user.image,
         skills: skillsByUserId.get(row.user.id) || [],
         lat: row.user.lat ? parseFloat(row.user.lat) : null,
         long: row.user.long ? parseFloat(row.user.long) : null,
         bio: row.user.bio,
         makerBio: row.user.makerBio,
         maker: row.user.maker || false,
         createdAt: row.user.createdAt || new Date(),
         phoneNumber: null, // Privacy: Hide phone number in public listings
         distance: row.distance as number,
         completedRepairs: row.reviewCount,
         level: UserRepository.calculateLevel(row.reviewCount),
         averageRating: row.avgRating
     }));
  }

  static async countCompletedRepairs(userId: string): Promise<number> {
      // Count reviews received by the user (as a maker)
      // This is more reliable than counting 'fixed' posts since reviews indicate actual completed work
      const result = await db.select({ count: count() })
        .from(reviewsTable)
        .where(eq(reviewsTable.targetUserId, userId));
      return result[0].count;
  }

  static async getTopMakers(limit: number = 500): Promise<User[]> {
      // Get top makers ordered by average rating and number of reviews
      const makers = await db.select({
          user: usersTable,
          avgRating: sql<number>`AVG(CAST(${reviewsTable.rating} AS DECIMAL))`.as('avg_rating'),
          reviewCount: count(reviewsTable.id).as('review_count')
      })
      .from(usersTable)
      .leftJoin(reviewsTable, eq(usersTable.id, reviewsTable.targetUserId))
      .where(eq(usersTable.maker, true))
      .groupBy(usersTable.id)
      .orderBy(sql`avg_rating DESC NULLS LAST, review_count DESC`)
      .limit(limit);

      // Extract user IDs for batch operations
      const userIds = makers.map(row => row.user.id);
      
      // Batch fetch skills for all users
      const skillsByUserId = new Map<string, Skill[]>();
      if (userIds.length > 0) {
          const skillsResults = await db
              .select({
                  userId: usersToSkillsTable.userId,
                  skill: skillsTable
              })
              .from(usersToSkillsTable)
              .innerJoin(skillsTable, eq(usersToSkillsTable.skillId, skillsTable.id))
              .where(inArray(usersToSkillsTable.userId, userIds))
              .orderBy(skillsTable.displayOrder);
          
          skillsResults.forEach(row => {
              if (!skillsByUserId.has(row.userId)) {
                  skillsByUserId.set(row.userId, []);
              }
              skillsByUserId.get(row.userId)!.push({
                  id: row.skill.id,
                  name: row.skill.name,
                  category: row.skill.category,
                  description: row.skill.description,
                  icon: row.skill.icon,
                  displayOrder: row.skill.displayOrder,
                  active: row.skill.active || false,
                  createdAt: row.skill.createdAt || new Date()
              });
          });
      }

      return makers.map(row => ({
          id: row.user.id,
          name: row.user.name,
          email: row.user.email,
          emailVerified: row.user.emailVerified,
          image: row.user.image,
          phoneNumber: row.user.phoneNumber,
          skills: skillsByUserId.get(row.user.id) || [],
          lat: row.user.lat ? parseFloat(row.user.lat) : null,
          long: row.user.long ? parseFloat(row.user.long) : null,
          bio: row.user.bio,
          makerBio: row.user.makerBio,
          maker: row.user.maker || false,
          createdAt: row.user.createdAt || new Date(),
          updatedAt: row.user.updatedAt || new Date(),
          completedRepairs: row.reviewCount,
          level: UserRepository.calculateLevel(row.reviewCount),
          averageRating: row.avgRating
      }));
  }

  static calculateLevel(completedRepairs: number): 'novice' | 'handyman' | 'master' {
      if (completedRepairs >= 21) return 'master';
      if (completedRepairs >= 6) return 'handyman';
      return 'novice';
  }
}
