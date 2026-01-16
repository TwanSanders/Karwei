
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';

// Hardcoded for local dev fix
const connectionString = "postgres://user:admin@localhost:5432/postgres";
if (!connectionString) throw new Error('DATABASE_URL is not set');

const client = postgres(connectionString);
const db = drizzle(client);

async function main() {
    try {
        console.log("Running manual migration...");

        // Add phone_number column
        console.log("Adding phone_number column...");
        try {
            await db.execute(sql`ALTER TABLE "karwei"."user" ADD COLUMN IF NOT EXISTS "phone_number" text`);
            console.log("Successfully added phone_number column.");
        } catch (e) {
            console.log("Error adding column (might exist?):", e);
        }

        // Create contact_request table
        console.log("Creating contact_request table...");
        try {
            await db.execute(sql`
                CREATE TABLE IF NOT EXISTS "karwei"."contact_request" (
                    "id" text PRIMARY KEY NOT NULL,
                    "requester_id" text NOT NULL REFERENCES "karwei"."user"("id"),
                    "target_user_id" text NOT NULL REFERENCES "karwei"."user"("id"),
                    "status" text DEFAULT 'pending' NOT NULL,
                    "created_at" timestamp DEFAULT now()
                )
            `);
            console.log("Successfully created contact_request table.");
        } catch (e) {
             console.log("Error creating table:", e);
        }

    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        await client.end();
    }
}

main();
