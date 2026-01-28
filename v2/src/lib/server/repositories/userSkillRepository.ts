import { db } from '../db';
import { usersToSkillsTable, skillsTable } from '../db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import type { Skill } from '$lib/domain/types';

export class UserSkillRepository {
  
  /**
   * Replace all user skills with new set
   * Uses transaction to ensure atomicity
   */
  static async setUserSkills(userId: string, skillIds: string[]): Promise<void> {
    await db.transaction(async (tx) => {
      // Remove existing skills
      await tx.delete(usersToSkillsTable).where(eq(usersToSkillsTable.userId, userId));
      
      // Add new skills
      if (skillIds.length > 0) {
        await tx.insert(usersToSkillsTable).values(
          skillIds.map(skillId => ({ userId, skillId }))
        );
      }
    });
  }
  
  /**
   * Add a single skill to user (idempotent)
   */
  static async addUserSkill(userId: string, skillId: string): Promise<void> {
    await db.insert(usersToSkillsTable)
      .values({ userId, skillId })
      .onConflictDoNothing();
  }
  
  /**
   * Remove a single skill from user
   */
  static async removeUserSkill(userId: string, skillId: string): Promise<void> {
    await db.delete(usersToSkillsTable)
      .where(
        and(
          eq(usersToSkillsTable.userId, userId),
          eq(usersToSkillsTable.skillId, skillId)
        )
      );
  }
  
  /**
   * Get all skills for a user, ordered by display order
   */
  static async getUserSkills(userId: string): Promise<Skill[]> {
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
  
  /**
   * Get all skills for multiple users efficiently (batch fetch)
   * Returns Map<userId, Skill[]>
   */
  static async getBatchUserSkills(userIds: string[]): Promise<Map<string, Skill[]>> {
    if (userIds.length === 0) {
      return new Map();
    }

    const results = await db
      .select({
        userId: usersToSkillsTable.userId,
        skill: skillsTable
      })
      .from(usersToSkillsTable)
      .innerJoin(skillsTable, eq(usersToSkillsTable.skillId, skillsTable.id))
      .where(inArray(usersToSkillsTable.userId, userIds))
      .orderBy(skillsTable.displayOrder);
    
    // Group by userId
    const skillsByUser = new Map<string, Skill[]>();
    
    results.forEach(row => {
      if (!skillsByUser.has(row.userId)) {
        skillsByUser.set(row.userId, []);
      }
      
      skillsByUser.get(row.userId)!.push({
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
    
    return skillsByUser;
  }
  
  /**
   * Get all users that have a specific skill
   */
  static async getUsersWithSkill(skillId: string): Promise<string[]> {
    const results = await db
      .select({ userId: usersToSkillsTable.userId })
      .from(usersToSkillsTable)
      .where(eq(usersToSkillsTable.skillId, skillId));
    
    return results.map(r => r.userId);
  }
  
  /**
   * Get user IDs that have ANY of the specified skills
   */
  static async getUsersWithAnySkills(skillIds: string[]): Promise<string[]> {
    if (skillIds.length === 0) {
      return [];
    }

    const results = await db
      .selectDistinct({ userId: usersToSkillsTable.userId })
      .from(usersToSkillsTable)
      .where(inArray(usersToSkillsTable.skillId, skillIds));
    
    return results.map(r => r.userId);
  }
}
