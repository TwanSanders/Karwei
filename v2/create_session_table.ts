
import postgres from 'postgres';

// Hardcoded for local dev fix
const connectionString = "postgres://user:admin@localhost:5432/postgres";
const client = postgres(connectionString);

async function main() {
    try {
        console.log("Creating session table...");
        
        await client`
            CREATE TABLE IF NOT EXISTS "karwei"."session" (
                "id" text PRIMARY KEY NOT NULL,
                "user_id" text NOT NULL REFERENCES "karwei"."user"("id"),
                "expires_at" timestamp with time zone NOT NULL
            )
        `;
        
        console.log("Successfully created session table.");

        // Verification
        const columns = await client`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'karwei' AND table_name = 'session'
        `;
        console.log("Columns verified:", columns.map(c => c.column_name));

    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        await client.end();
    }
}

main();
