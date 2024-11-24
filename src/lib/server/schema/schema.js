import { float } from "drizzle-orm/mysql-core";
import {
  boolean,
  timestamp,
  primaryKey,
  varchar,
  text,
  pgSchema,
  serial,
  numeric,
  decimal,
} from "drizzle-orm/pg-core";

export const schema = pgSchema("karwei");

export const usersTable = schema.table("user", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 60 }).notNull(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
    fsp: 3,
  }),
  image: varchar("image", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  skills: varchar("skills", { length: 300 }),
  lat: decimal("lat", { precision: 10, scale: 2 }),
  long: decimal("long", { precision: 10, scale: 2 }),
  bio: varchar("bio", { length: 255 }),
  maker: boolean("maker"),
});

export const postsTable = schema.table("post", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => usersTable.id),
  title: varchar("title", { length: 255 }).notNull(),
  imageUrl: varchar("image_url", { length: 255 }),
  description: text("description"),
  purchasedAt: timestamp("purchased_at"),
  createdAt: timestamp("created_at").defaultNow(),
  type: varchar("type", { length: 255 }),
  targetPrice: decimal("target_price", { precision: 10, scale: 2 }),
});

export const commentsTable = schema.table("comment", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => usersTable.id),
  postId: varchar("post_id", { length: 255 })
    .notNull()
    .references(() => postsTable.id),
  message: varchar("message", { length: 255 }).notNull(),
  imageUrl: varchar("image_url", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});
