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
}
