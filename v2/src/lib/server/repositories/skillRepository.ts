import { db } from '../db';
import { skillsTable } from '../db/schema';
import { eq, asc } from 'drizzle-orm';
import type { Skill } from '$lib/domain/types';

export class SkillRepository {
  static async getAll(): Promise<Skill[]> {
    const results = await db.select().from(skillsTable).orderBy(asc(skillsTable.displayOrder));
    
    return results.map(row => ({
      id: row.id,
      name: row.name,
      category: row.category,
      description: row.description,
      icon: row.icon,
      displayOrder: row.displayOrder,
      active: row.active || false,
      createdAt: row.createdAt || new Date(),
    }));
  }

  static async getActive(): Promise<Skill[]> {
    const results = await db
      .select()
      .from(skillsTable)
      .where(eq(skillsTable.active, true))
      .orderBy(asc(skillsTable.displayOrder));
    
    return results.map(row => ({
      id: row.id,
      name: row.name,
      category: row.category,
      description: row.description,
      icon: row.icon,
      displayOrder: row.displayOrder,
      active: row.active || false,
      createdAt: row.createdAt || new Date(),
    }));
  }

  static async create(skillData: typeof skillsTable.$inferInsert): Promise<Skill> {
    const result = await db.insert(skillsTable).values(skillData).returning();
    const row = result[0];
    
    return {
      id: row.id,
      name: row.name,
      category: row.category,
      description: row.description,
      icon: row.icon,
      displayOrder: row.displayOrder,
      active: row.active || false,
      createdAt: row.createdAt || new Date(),
    };
  }

  static async update(id: string, skillData: Partial<typeof skillsTable.$inferInsert>): Promise<Skill | null> {
    const result = await db
      .update(skillsTable)
      .set(skillData)
      .where(eq(skillsTable.id, id))
      .returning();
    
    if (result.length === 0) return null;
    
    const row = result[0];
    return {
      id: row.id,
      name: row.name,
      category: row.category,
      description: row.description,
      icon: row.icon,
      displayOrder: row.displayOrder,
      active: row.active || false,
      createdAt: row.createdAt || new Date(),
    };
  }

  static async delete(id: string): Promise<void> {
    await db.delete(skillsTable).where(eq(skillsTable.id, id));
  }
}
