import { db } from '$lib/server/db';
import { conversationsTable, messagesTable, usersTable, postsTable } from '$lib/server/db/schema';
import { eq, desc, and, or, sql } from 'drizzle-orm';
import type { Conversation, Message, User, Post } from '$lib/domain/types';

export const ChatRepository = {
  /**
   * Get or create a conversation between two users (order-independent)
   */
  async getOrCreateConversation(userId1: string, userId2: string): Promise<string> {
    // Ensure consistent ordering for query
    const [userA, userB] = userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];

    // Try to find existing conversation
    const existing = await db
      .select()
      .from(conversationsTable)
      .where(
        or(
          and(eq(conversationsTable.userAId, userA), eq(conversationsTable.userBId, userB)),
          and(eq(conversationsTable.userAId, userB), eq(conversationsTable.userBId, userA))
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return existing[0].id;
    }

    // Create new conversation
    const result = await db
      .insert(conversationsTable)
      .values({
        userAId: userA,
        userBId: userB,
      })
      .returning();

    return result[0].id;
  },

  /**
   * Get conversation by ID
   */
  async getConversationById(conversationId: string): Promise<Conversation | null> {
    const results = await db
      .select()
      .from(conversationsTable)
      .where(eq(conversationsTable.id, conversationId));

    if (results.length === 0) return null;

    const row = results[0];
    return {
      id: row.id,
      userAId: row.userAId,
      userBId: row.userBId,
      createdAt: row.createdAt || new Date(),
      updatedAt: row.updatedAt || new Date(),
    };
  },

  /**
   * Get conversation between two specific users
   */
  async getConversationBetweenUsers(userId1: string, userId2: string): Promise<Conversation | null> {
    const results = await db
      .select()
      .from(conversationsTable)
      .where(
        or(
          and(eq(conversationsTable.userAId, userId1), eq(conversationsTable.userBId, userId2)),
          and(eq(conversationsTable.userAId, userId2), eq(conversationsTable.userBId, userId1))
        )
      )
      .limit(1);

    if (results.length === 0) return null;

    const row = results[0];
    return {
      id: row.id,
      userAId: row.userAId,
      userBId: row.userBId,
      createdAt: row.createdAt || new Date(),
      updatedAt: row.updatedAt || new Date(),
    };
  },

  /**
   * Get all messages in a conversation with sender details
   */
  async getMessages(conversationId: string, limit: number = 100): Promise<(Message & { sender: User })[]> {
    const results = await db
      .select({
        id: messagesTable.id,
        conversationId: messagesTable.conversationId,
        senderId: messagesTable.senderId,
        content: messagesTable.content,
        type: messagesTable.type,
        relatedEntityId: messagesTable.relatedEntityId,
        createdAt: messagesTable.createdAt,
        // Sender details
        senderName: usersTable.name,
        senderImage: usersTable.image,
        senderEmail: usersTable.email,
        senderMaker: usersTable.maker,
      })
      .from(messagesTable)
      .leftJoin(usersTable, eq(messagesTable.senderId, usersTable.id))
      .where(eq(messagesTable.conversationId, conversationId))
      .orderBy(messagesTable.createdAt)
      .limit(limit);

    return results.map(row => ({
      id: row.id,
      conversationId: row.conversationId,
      senderId: row.senderId,
      content: row.content,
      type: row.type as 'text' | 'system_event' | 'image',
      relatedEntityId: row.relatedEntityId,
      createdAt: row.createdAt || new Date(),
      sender: {
        id: row.senderId,
        name: row.senderName || 'Unknown',
        email: row.senderEmail || '',
        image: row.senderImage,
        maker: row.senderMaker || false,
        createdAt: new Date(),
      },
    }));
  },

  /**
   * Send a message
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    type: 'text' | 'system_event' | 'image' = 'text',
    relatedEntityId?: string
  ): Promise<Message> {
    const result = await db
      .insert(messagesTable)
      .values({
        conversationId,
        senderId,
        content,
        type,
        relatedEntityId: relatedEntityId || null,
      })
      .returning();

    // Update conversation's updated_at timestamp
    await db
      .update(conversationsTable)
      .set({ updatedAt: new Date() })
      .where(eq(conversationsTable.id, conversationId));

    const row = result[0];
    return {
      id: row.id,
      conversationId: row.conversationId,
      senderId: row.senderId,
      content: row.content,
      type: row.type as 'text' | 'system_event' | 'image',
      relatedEntityId: row.relatedEntityId,
      createdAt: row.createdAt || new Date(),
    };
  },

  /**
   * Inject a system message (shorthand for sendMessage with type='system_event')
   */
  async injectSystemMessage(
    conversationId: string,
    relatedPostId: string,
    eventText: string
  ): Promise<Message> {
    // Use a dummy system user ID (first user in conversation)
    const conversation = await this.getConversationById(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    return this.sendMessage(
      conversationId,
      conversation.userAId, // System messages sent "from" userA by convention
      eventText,
      'system_event',
      relatedPostId
    );
  },

  /**
   * Get all conversations for a user with preview data
   */
  async getUserConversations(userId: string): Promise<Array<{
    conversation: Conversation;
    partner: User;
    lastMessage?: Message;
    unreadCount: number;
  }>> {
    // Get all conversations where user is either userA or userB
    const conversations = await db
      .select()
      .from(conversationsTable)
      .where(
        or(
          eq(conversationsTable.userAId, userId),
          eq(conversationsTable.userBId, userId)
        )
      )
      .orderBy(desc(conversationsTable.updatedAt));

    const result = [];

    for (const conv of conversations) {
      // Determine partner ID
      const partnerId = conv.userAId === userId ? conv.userBId : conv.userAId;

      // Get partner details
      const partnerResults = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, partnerId));

      if (partnerResults.length === 0) continue;

      const partnerRow = partnerResults[0];
      const partner: User = {
        id: partnerRow.id,
        name: partnerRow.name,
        email: partnerRow.email,
        phoneNumber: partnerRow.phoneNumber,
        image: partnerRow.image,
        skills: partnerRow.skills,
        lat: partnerRow.lat ? parseFloat(partnerRow.lat) : null,
        long: partnerRow.long ? parseFloat(partnerRow.long) : null,
        bio: partnerRow.bio,
        maker: partnerRow.maker || false,
        createdAt: partnerRow.createdAt || new Date(),
      };

      // Get last message
      const lastMessages = await db
        .select()
        .from(messagesTable)
        .where(eq(messagesTable.conversationId, conv.id))
        .orderBy(desc(messagesTable.createdAt))
        .limit(1);

      const lastMessage = lastMessages.length > 0 ? {
        id: lastMessages[0].id,
        conversationId: lastMessages[0].conversationId,
        senderId: lastMessages[0].senderId,
        content: lastMessages[0].content,
        type: lastMessages[0].type as 'text' | 'system_event' | 'image',
        relatedEntityId: lastMessages[0].relatedEntityId,
        createdAt: lastMessages[0].createdAt || new Date(),
      } : undefined;

      result.push({
        conversation: {
          id: conv.id,
          userAId: conv.userAId,
          userBId: conv.userBId,
          createdAt: conv.createdAt || new Date(),
          updatedAt: conv.updatedAt || new Date(),
        },
        partner,
        lastMessage,
        unreadCount: 0, // TODO: Implement read status tracking
      });
    }

    return result;
  },

  /**
   * Get active jobs between two users
   */
  async getActiveJobsBetweenUsers(userId1: string, userId2: string): Promise<Post[]> {
    const results = await db
      .select()
      .from(postsTable)
      .where(
        and(
          or(
            and(eq(postsTable.userId, userId1), eq(postsTable.makerId, userId2)),
            and(eq(postsTable.userId, userId2), eq(postsTable.makerId, userId1))
          ),
          or(
            eq(postsTable.status, 'in_progress'),
            eq(postsTable.status, 'fixed')
          )
        )
      )
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
      lat: row.lat ? parseFloat(row.lat) : null,
      long: row.long ? parseFloat(row.long) : null,
      score: row.score ? parseFloat(row.score) : null,
      createdAt: row.createdAt || new Date(),
    }));
  },

  /**
   * Mark a conversation as read by updating the user's last_read_at timestamp
   */
  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      const conversation = await db.query.conversationsTable.findFirst({
        where: eq(conversationsTable.id, conversationId)
      });

      if (!conversation) return;

      const now = new Date();
      
      // Determine which column to update based on user position
      if (conversation.userAId === userId) {
        await db.update(conversationsTable)
          .set({ userALastReadAt: now })
          .where(eq(conversationsTable.id, conversationId));
      } else if (conversation.userBId === userId) {
        await db.update(conversationsTable)
          .set({ userBLastReadAt: now })
          .where(eq(conversationsTable.id, conversationId));
      }
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  },

  /**
   * Get count of unread messages across all user's conversations
   */
  async getUnreadMessageCount(userId: string): Promise<number> {
    try {
      // Get all conversations where user is a participant
      const userConversations = await db.query.conversationsTable.findMany({
        where: or(
          eq(conversationsTable.userAId, userId),
          eq(conversationsTable.userBId, userId)
        )
      });

      let unreadCount = 0;

      // For each conversation, count messages created after user's last read
      for (const conv of userConversations) {
        const lastReadAt = conv.userAId === userId ? conv.userALastReadAt : conv.userBLastReadAt;
        const partnerId = conv.userAId === userId ? conv.userBId : conv.userAId;

        // Count messages from partner created after last read
        const unreadMessages = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(messagesTable)
          .where(
            and(
              eq(messagesTable.conversationId, conv.id),
              eq(messagesTable.senderId, partnerId),
              sql`${messagesTable.createdAt} > ${lastReadAt || new Date(0)}`
            )
          );

        unreadCount += Number(unreadMessages[0]?.count || 0);
      }

      return unreadCount;
    } catch (error) {
      console.error('Error counting unread messages:', error);
      return 0;
    }
  },
};
