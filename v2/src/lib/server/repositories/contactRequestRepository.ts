import { db } from '../db';
import { contactRequestsTable } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export interface ContactRequest {
    id: string;
    requesterId: string;
    targetUserId: string;
    status: 'pending' | 'accepted' | 'denied';
    createdAt: Date;
}

export class ContactRequestRepository {
    static async create(requesterId: string, targetUserId: string): Promise<ContactRequest> {
        const result = await db.insert(contactRequestsTable).values({
            requesterId,
            targetUserId
        }).returning();
        
        const row = result[0];
        return {
            id: row.id,
            requesterId: row.requesterId,
            targetUserId: row.targetUserId,
            status: row.status as 'pending' | 'accepted' | 'denied',
            createdAt: row.createdAt || new Date(),
        }
    }

    static async getStatus(requesterId: string, targetUserId: string): Promise<ContactRequest | null> {
        const result = await db.select().from(contactRequestsTable).where(
            and(
                eq(contactRequestsTable.requesterId, requesterId),
                eq(contactRequestsTable.targetUserId, targetUserId)
            )
        );

        if (result.length === 0) return null;

        const row = result[0];
        return {
            id: row.id,
            requesterId: row.requesterId,
            targetUserId: row.targetUserId,
            status: row.status as 'pending' | 'accepted' | 'denied',
            createdAt: row.createdAt || new Date(),
        };
    }

    static async getByTargetUser(targetUserId: string): Promise<ContactRequest[]> {
        const result = await db.select().from(contactRequestsTable).where(
            eq(contactRequestsTable.targetUserId, targetUserId)
        );

        return result.map(row => ({
            id: row.id,
            requesterId: row.requesterId,
            targetUserId: row.targetUserId,
            status: row.status as 'pending' | 'accepted' | 'denied',
            createdAt: row.createdAt || new Date(),
        }));
    }

    static async updateStatus(id: string, status: 'accepted' | 'denied'): Promise<void> {
        await db.update(contactRequestsTable)
            .set({ status })
            .where(eq(contactRequestsTable.id, id));
    }
}
