import { db } from '$lib/server/db';
import { conversationsTable, messagesTable, usersTable, postsTable, contactRequestsTable, offersTable } from '$lib/server/db/schema';
import { eq, desc, and, or, sql, inArray, gt } from 'drizzle-orm';
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
    try {
      const result = await db
        .insert(conversationsTable)
        .values({
          userAId: userA,
          userBId: userB,
        })
        .returning();

      return result[0].id;
    } catch (error: any) {
      // Handle unique constraint violation (Race condition)
      if (error.code === '23505') {
        const existingAgain = await db
          .select()
          .from(conversationsTable)
          .where(
            and(eq(conversationsTable.userAId, userA), eq(conversationsTable.userBId, userB))
          )
          .limit(1);
          
        if (existingAgain.length > 0) {
          return existingAgain[0].id;
        }
      }
      throw error;
    }
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
      .orderBy(desc(messagesTable.createdAt))
      .limit(limit);

    return results.reverse().map(row => ({
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

    if (conversations.length === 0) return [];

    const conversationIds = conversations.map(c => c.id);
    const partnerIds = conversations.map(c => c.userAId === userId ? c.userBId : c.userAId);

    // 2. Get all partners
    const partners = await db
      .select()
      .from(usersTable)
      .where(inArray(usersTable.id, partnerIds));
    
    const partnerMap = new Map(partners.map(p => [p.id, p]));

    // 3. Get last messages for these conversations (Postgres DISTINCT ON)
    const lastMessages = await db
      .selectDistinctOn([messagesTable.conversationId])
      .from(messagesTable)
      .where(inArray(messagesTable.conversationId, conversationIds))
      .orderBy(messagesTable.conversationId, desc(messagesTable.createdAt));

    const messageMap = new Map(lastMessages.map(m => [m.conversationId, m]));

    for (const conv of conversations) {
      // Determine partner ID
      const partnerId = conv.userAId === userId ? conv.userBId : conv.userAId;

      const partnerRow = partnerMap.get(partnerId);

      if (!partnerRow) continue;

      const partner: User = {
        id: partnerRow.id,
        name: partnerRow.name,
        email: partnerRow.email,
        phoneNumber: partnerRow.phoneNumber,
        image: partnerRow.image,
        skills: [], // Skills parsing not implemented for chat view yet
        lat: partnerRow.lat ? parseFloat(partnerRow.lat) : null,
        long: partnerRow.long ? parseFloat(partnerRow.long) : null,
        bio: partnerRow.bio,
        maker: partnerRow.maker || false,
        createdAt: partnerRow.createdAt || new Date(),
      };

      const msgRow = messageMap.get(conv.id);

      const lastMessage = msgRow ? {
        id: msgRow.id,
        conversationId: msgRow.conversationId,
        senderId: msgRow.senderId,
        content: msgRow.content,
        type: msgRow.type as 'text' | 'system_event' | 'image',
        relatedEntityId: msgRow.relatedEntityId,
        createdAt: msgRow.createdAt || new Date(),
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
    // 1. Get assigned jobs (in_progress or fixed)
    const assignedJobs = await db
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
      );

    // Enhance assigned jobs with the accepted offer price
    const assignedJobsWithOfferPrice = await Promise.all(assignedJobs.map(async (job) => {
        if (!job.makerId) return job;
        
        // Find the accepted offer (the offer from the maker for this post)
        // Since the maker is assigned, their offer is the "accepted" one.
        const offers = await db.select()
            .from(offersTable)
            .where(and(eq(offersTable.postId, job.id), eq(offersTable.makerId, job.makerId)))
            .limit(1);
            
        if (offers.length > 0 && offers[0].price) {
            // Override targetPrice with the agreed offer price
            return { ...job, targetPrice: offers[0].price };
        }
        return job;
    }));

    // 2. Get jobs where an offer exists (pending/open context)
    // Find offers between these two users
    const offers = await db
      .select({ postId: offersTable.postId })
      .from(offersTable)
      .where(
        or(
          and(eq(offersTable.makerId, userId1), eq(offersTable.userId, userId2)),
          and(eq(offersTable.makerId, userId2), eq(offersTable.userId, userId1))
        )
      );
    
    const offerPostIds = offers.map(o => o.postId);
    
    let offeredJobs: typeof assignedJobs = [];
    if (offerPostIds.length > 0) {
        offeredJobs = await db
            .select()
            .from(postsTable)
            .where(
                and(
                    inArray(postsTable.id, offerPostIds),
                    eq(postsTable.status, 'open')
                )
            );
    }

    // Merge and deduplicate (prefer assigned/active versions if duplicates exist, though status check should prevent overlap usually)
    // Actually, offers on 'open' posts vs assigned jobs on 'in_progress' are mutually exclusive sets of posts normally.
    const allJobs = [...assignedJobsWithOfferPrice, ...offeredJobs];
    const uniqueJobs = Array.from(new Map(allJobs.map(job => [job.id, job])).values());
    
    // Sort by creation date
    uniqueJobs.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
    });

    return uniqueJobs.map(row => ({
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
   * Check if there is an accepted contact request between two users
   */
  async hasAcceptedContactRequest(userId1: string, userId2: string): Promise<boolean> {
    const result = await db
      .select()
      .from(contactRequestsTable)
      .where(
        and(
          or(
            and(eq(contactRequestsTable.requesterId, userId1), eq(contactRequestsTable.targetUserId, userId2)),
            and(eq(contactRequestsTable.requesterId, userId2), eq(contactRequestsTable.targetUserId, userId1))
          ),
          eq(contactRequestsTable.status, 'accepted')
        )
      )
      .limit(1);

    return result.length > 0;
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
              gt(messagesTable.createdAt, lastReadAt || new Date(0))
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
