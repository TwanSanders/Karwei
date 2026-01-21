-- Migration: Add read tracking to conversation table
-- This allows tracking when each user last read their messages

ALTER TABLE karwei.conversation 
ADD COLUMN user_a_last_read_at TIMESTAMP DEFAULT NOW() NOT NULL,
ADD COLUMN user_b_last_read_at TIMESTAMP DEFAULT NOW() NOT NULL;

-- Update existing conversations to current time
UPDATE karwei.conversation 
SET user_a_last_read_at = NOW(), 
    user_b_last_read_at = NOW();
