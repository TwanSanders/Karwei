import { pgTable, text, timestamp, boolean, varchar, decimal, integer, pgSchema, primaryKey, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const karweiSchema = pgSchema("karwei");

export const usersTable = karweiSchema.table("user", {
	id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
	name: text("name").notNull(),
	email: text("email").unique().notNull(),
	passwordHash: text("password_hash").notNull(),
	emailVerified: timestamp("emailVerified", { mode: "date", precision: 3 }),
	image: text("image"),
	phoneNumber: text("phone_number"),
	skills: text("skills"), // Comma separated skills
	lat: decimal("lat", { precision: 12, scale: 8 }),
	long: decimal("long", { precision: 12, scale: 8 }),
	bio: text("bio"),
	makerBio: text("maker_bio"),
	maker: boolean("maker").default(false),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export const sessionsTable = karweiSchema.table("session", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => usersTable.id),
	expiresAt: timestamp("expires_at", {
		withTimezone: true,
		mode: "date"
	}).notNull()
});

export const postsTable = karweiSchema.table("post", {
	id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
	userId: text("user_id").notNull().references(() => usersTable.id),
	title: text("title").notNull(),
	imageUrl: text("image_url"),
	description: text("description"),
	purchasedAt: timestamp("purchased_at"),
	type: text("type"),
	targetPrice: decimal("target_price", { precision: 10, scale: 2 }),
	makerId: text("maker_id"), // Assigned maker?
	status: text("status", { enum: ["open", "in_progress", "fixed", "closed"] }).default("open").notNull(),
	lat: decimal("lat", { precision: 12, scale: 8 }),
	long: decimal("long", { precision: 12, scale: 8 }),
	score: decimal("score", { precision: 10, scale: 2 }),
	createdAt: timestamp("created_at").defaultNow(),
});

export const commentsTable = karweiSchema.table("comment", {
	id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
	userId: text("user_id").notNull().references(() => usersTable.id),
	postId: text("post_id").notNull().references(() => postsTable.id),
	message: text("message").notNull(),
	imageUrl: text("image_url"),
	createdAt: timestamp("created_at").defaultNow(),
});

export const offersTable = karweiSchema.table("offer", {
	id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
	userId: text("user_id").notNull().references(() => usersTable.id),
	postId: text("post_id").notNull().references(() => postsTable.id),
	makerId: text("maker_id").notNull().references(() => usersTable.id),
	message: text("message").notNull(),
	price: decimal("price", { precision: 10, scale: 2 }),
	createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
	uniqueOffer: sql`UNIQUE (${table.makerId}, ${table.postId})`
}));

export const reviewsTable = karweiSchema.table("review", {
	id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
	reviewerId: text("reviewer_id").notNull().references(() => usersTable.id),
	targetUserId: text("target_user_id").notNull().references(() => usersTable.id),
	postId: text("post_id").notNull().references(() => postsTable.id),
	rating: decimal("rating", { precision: 2, scale: 1 }).notNull(), // 1.0 to 5.0
	comment: text("comment"),
	createdAt: timestamp("created_at").defaultNow(),
});

export const contactRequestsTable = karweiSchema.table("contact_request", {
	id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
	requesterId: text("requester_id").notNull().references(() => usersTable.id),
	targetUserId: text("target_user_id").notNull().references(() => usersTable.id),
	status: text("status", { enum: ["pending", "accepted", "denied"] }).default("pending").notNull(),
	createdAt: timestamp("created_at").defaultNow(),
});

export const notificationsTable = karweiSchema.table("notification", {
	id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
	userId: text("user_id").notNull().references(() => usersTable.id),
	type: text("type", { enum: ["offer", "accept", "contact_request", "unassign", "job_completed", "job_reopened"] }).notNull(),
	relatedId: text("related_id").notNull(), // ID of the Offer, Post, or ContactRequest
	read: boolean("read").default(false).notNull(),
	createdAt: timestamp("created_at").defaultNow(),
});

export const skillsTable = karweiSchema.table("skill", {
	id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
	name: text("name").notNull().unique(),
	category: text("category"),
	description: text("description"),
	icon: text("icon"),
	displayOrder: integer("display_order"),
	active: boolean("active").default(true),
	createdAt: timestamp("created_at").defaultNow(),
});

export const usersToSkillsTable = karweiSchema.table("users_to_skills", {
	userId: text("user_id")
		.notNull()
		.references(() => usersTable.id, { onDelete: 'cascade' }),
	skillId: text("skill_id")
		.notNull()
		.references(() => skillsTable.id, { onDelete: 'cascade' }),
}, (t) => ({
	pk: primaryKey({ columns: [t.userId, t.skillId] }),
	userIdIdx: index("users_to_skills_user_id_idx").on(t.userId),
	skillIdIdx: index("users_to_skills_skill_id_idx").on(t.skillId),
}));

export const conversationsTable = karweiSchema.table("conversation", {
	id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
	userAId: text("user_a_id").notNull().references(() => usersTable.id),
	userBId: text("user_b_id").notNull().references(() => usersTable.id),
	userALastReadAt: timestamp("user_a_last_read_at").defaultNow().notNull(),
	userBLastReadAt: timestamp("user_b_last_read_at").defaultNow().notNull(),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
	// Unique constraint ensuring only one conversation per user-pair (order-independent)
	uniqueUserPair: sql`UNIQUE (LEAST(${table.userAId}, ${table.userBId}), GREATEST(${table.userAId}, ${table.userBId}))`
}));

export const messagesTable = karweiSchema.table("message", {
	id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
	conversationId: text("conversation_id").notNull().references(() => conversationsTable.id),
	senderId: text("sender_id").notNull().references(() => usersTable.id),
	content: text("content").notNull(),
	type: text("type", { enum: ["text", "system_event", "image"] }).default("text").notNull(),
	relatedEntityId: text("related_entity_id"), // Nullable - stores Post ID for system events
	createdAt: timestamp("created_at").defaultNow(),
});


export const aiConversationsTable = karweiSchema.table("ai_conversation", {
	id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
	userId: text("user_id").notNull().references(() => usersTable.id),
	postId: text("post_id").notNull().references(() => postsTable.id),
	title: text("title").notNull().default("New Chat"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export const aiMessagesTable = karweiSchema.table("ai_message", {
	id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
	conversationId: text("conversation_id").notNull().references(() => aiConversationsTable.id),
	role: text("role", { enum: ["user", "assistant"] }).notNull(),
	content: text("content").notNull(),
	createdAt: timestamp("created_at").defaultNow(),
});
