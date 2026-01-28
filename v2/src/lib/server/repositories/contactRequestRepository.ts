import { db } from '../db';
import { contactRequestsTable } from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { NotificationRepository } from './notificationRepository';

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

        // Trigger Notification
        await NotificationRepository.create(targetUserId, 'contact_request', row.id);

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

        if (status === 'accepted') {
             // Fetch request to get requester ID
             const request = await db.select().from(contactRequestsTable).where(eq(contactRequestsTable.id, id)).then(res => res[0]);
             if (request) {
                // Notify the requester that their request was accepted
                await NotificationRepository.create(request.requesterId, 'contact_request', id); 
                // Note: reusing 'contact_request' type, frontend can check status or we can add 'contact_request_accepted' type.
                // For now, let's stick to simple types. 'contact_request' notification for requester means "Check your requests"
             }
        }
    }
    static async getPendingCount(userId: string): Promise<number> {
        const result = await db
            .select({ count: sql<number>`count(*)` })
            .from(contactRequestsTable)
            .where(
                and(
                    eq(contactRequestsTable.targetUserId, userId),
                    eq(contactRequestsTable.status, 'pending')
                )
            );
            
        return Number(result[0].count);
    }
}
