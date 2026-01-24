
import { db } from '$lib/server/db';
import { aiConversationsTable, aiMessagesTable } from '$lib/server/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export const AIConversationRepository = {
    /**
     * Create a new AI conversation for a specific post
     */
    async createConversation(userId: string, postId: string, initialTitle: string = 'New Chat') {
        const result = await db.insert(aiConversationsTable).values({
            userId,
            postId,
            title: initialTitle
        }).returning();
        return result[0];
    },

    /**
     * Get all AI conversations for a user on a specific post
     */
    async getConversations(userId: string, postId: string) {
        return await db.select()
            .from(aiConversationsTable)
            .where(and(
                eq(aiConversationsTable.userId, userId),
                eq(aiConversationsTable.postId, postId)
            ))
            .orderBy(desc(aiConversationsTable.updatedAt));
    },

    /**
     * Get a specific conversation by ID (and verify ownership)
     */
    async getConversationById(conversationId: string, userId?: string) {
        const conditions = [eq(aiConversationsTable.id, conversationId)];
        if (userId) {
            conditions.push(eq(aiConversationsTable.userId, userId));
        }
        
        const result = await db.select()
            .from(aiConversationsTable)
            .where(and(...conditions));
        return result[0] || null;
    },

    /**
     * Add a message to the conversation
     */
    async addMessage(conversationId: string, role: 'user' | 'assistant', content: string) {
        // Add message
        const message = await db.insert(aiMessagesTable).values({
            conversationId,
            role,
            content
        }).returning();

        // Update conversation timestamp
        await db.update(aiConversationsTable)
            .set({ updatedAt: new Date() })
            .where(eq(aiConversationsTable.id, conversationId));

        return message[0];
    },

    /**
     * Get message history for a conversation
     */
    async getMessages(conversationId: string) {
        return await db.select()
            .from(aiMessagesTable)
            .where(eq(aiMessagesTable.conversationId, conversationId))
            .orderBy(aiMessagesTable.createdAt); // Ascending order for context
    },

    /**
     * Update conversation title
     */
    async updateTitle(conversationId: string, title: string) {
        return await db.update(aiConversationsTable)
            .set({ title })
            .where(eq(aiConversationsTable.id, conversationId))
            .returning();
    },
    
    /**
     * Delete a conversation
     */
    async deleteConversation(conversationId: string, userId: string) {
        // Verify ownership
        const conv = await this.getConversationById(conversationId, userId);
        if (!conv) throw new Error("Conversation not found");

        // Delete messages first (cascade usually handles this but being explicit is safe)
        await db.delete(aiMessagesTable).where(eq(aiMessagesTable.conversationId, conversationId));
        
        // Delete conversation
        await db.delete(aiConversationsTable).where(eq(aiConversationsTable.id, conversationId));
    }
};
