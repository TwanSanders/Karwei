import { db } from '../db';
import { usersTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import type { User } from '$lib/domain/types';

export class UserRepository {
  static async findByEmail(email: string): Promise<User | null> {
    const result = await db.select().from(usersTable).where(eq(usersTable.email, email));
    
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
  
  static async getById(id: string): Promise<User | null> {
    const result = await db.select().from(usersTable).where(eq(usersTable.id, id));
    
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
  static async getMakers(userLat?: number, userLong?: number, maxDistanceKm?: number): Promise<User[]> {
     let query = db.select().from(usersTable).where(eq(usersTable.maker, true));
     
     // Note: In a real app we would replicate the SQL distance sort here.
     // For this prototype, we'll fetch all makers and filter/sort in memory to reuse logic easily or duplicate sql.
     // Let's use memory filter for simplicity as number of users is small.
     
     const results = await query;
     
     let makers = results.map(row => ({
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
     }));

     if (userLat && userLong) {
        makers = makers.filter(maker => {
            if (!maxDistanceKm || !maker.lat || !maker.long) return true;
            const R = 6371; // km
            const dLat = (maker.lat - userLat) * Math.PI / 180;
            const dLon = (maker.long - userLong) * Math.PI / 180;
            const lat1 = userLat * Math.PI / 180;
            const lat2 = maker.lat * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
            const d = R * c;
            return d <= maxDistanceKm;
        }).sort((a, b) => {
             if (!a.lat || !a.long) return 1;
             if (!b.lat || !b.long) return -1;
             
             // Simple distance calc for sort
             const distA = Math.pow(a.lat - userLat, 2) + Math.pow(a.long - userLong, 2);
             const distB = Math.pow(b.lat - userLat, 2) + Math.pow(b.long - userLong, 2);
             return distA - distB;
        });
     }
     
     return makers;
  }
}
