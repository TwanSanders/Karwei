-- Migration: Create conversations and messages tables for 1-on-1 chat system

-- Create conversations table
CREATE TABLE IF NOT EXISTS "karwei"."conversation" (
    "id" text PRIMARY KEY NOT NULL,
    "user_a_id" text NOT NULL,
    "user_b_id" text NOT NULL,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
    CONSTRAINT "conversation_user_a_id_user_id_fk" FOREIGN KEY ("user_a_id") REFERENCES "karwei"."user"("id") ON DELETE no action ON UPDATE no action,
    CONSTRAINT "conversation_user_b_id_user_id_fk" FOREIGN KEY ("user_b_id") REFERENCES "karwei"."user"("id") ON DELETE no action ON UPDATE no action
);

-- Create unique index to ensure only one conversation per user-pair (order-independent)
CREATE UNIQUE INDEX IF NOT EXISTS "conversation_unique_user_pair_idx" 
    ON "karwei"."conversation"(LEAST("user_a_id", "user_b_id"), GREATEST("user_a_id", "user_b_id"));

-- Create messages table
CREATE TABLE IF NOT EXISTS "karwei"."message" (
    "id" text PRIMARY KEY NOT NULL,
    "conversation_id" text NOT NULL,
    "sender_id" text NOT NULL,
    "content" text NOT NULL,
    "type" text DEFAULT 'text' NOT NULL,
    "related_entity_id" text,
    "created_at" timestamp DEFAULT now(),
    CONSTRAINT "message_conversation_id_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "karwei"."conversation"("id") ON DELETE no action ON UPDATE no action,
    CONSTRAINT "message_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "karwei"."user"("id") ON DELETE no action ON UPDATE no action
);

-- Create index on conversation_id for faster message lookups
CREATE INDEX IF NOT EXISTS "message_conversation_id_idx" ON "karwei"."message"("conversation_id");

-- Create index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS "message_created_at_idx" ON "karwei"."message"("created_at");
