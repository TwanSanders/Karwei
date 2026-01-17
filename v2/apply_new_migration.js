import fs from 'fs';
import postgres from 'postgres';

async function main() {
    try {
        console.log('Reading .env...');
        const env = fs.readFileSync('.env', 'utf-8');
        let dbUrl = '';
        const lines = env.split('\n');
        for (const line of lines) {
            if (line.trim().startsWith('DATABASE_URL=')) {
                let val = line.split('=')[1].trim();
                // Handle quotes
                if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                    val = val.slice(1, -1);
                }
                dbUrl = val;
                break;
            }
        }

        if (!dbUrl) {
            console.error('DATABASE_URL not found in .env');
            process.exit(1);
        }

        console.log('Connecting to DB...');
        const sql = postgres(dbUrl);

        // 1. Add columns to Post table
        console.log('Updating Post table...');
        try { await sql`ALTER TABLE "karwei"."post" ADD COLUMN "lat" numeric(10, 6)`; console.log('Added lat to post'); } catch (e) { console.log('lat in post error/exists:', e.message); }
        try { await sql`ALTER TABLE "karwei"."post" ADD COLUMN "long" numeric(10, 6)`; console.log('Added long to post'); } catch (e) { console.log('long in post error/exists:', e.message); }
        try { await sql`ALTER TABLE "karwei"."post" ADD COLUMN "score" numeric(10, 2)`; console.log('Added score to post'); } catch (e) { console.log('score in post error/exists:', e.message); }

        // 2. Add columns to User table
        console.log('Updating User table...');
        try { await sql`ALTER TABLE "karwei"."user" ADD COLUMN "lat" numeric(10, 6)`; console.log('Added lat to user'); } catch (e) { console.log('lat in user error/exists:', e.message); }
        try { await sql`ALTER TABLE "karwei"."user" ADD COLUMN "long" numeric(10, 6)`; console.log('Added long to user'); } catch (e) { console.log('long in user error/exists:', e.message); }

        // 3. Create Notification table
        console.log('Creating Notification table...');
        try {
            await sql`
            CREATE TABLE IF NOT EXISTS "karwei"."notification" (
                "id" text PRIMARY KEY NOT NULL,
                "user_id" text NOT NULL,
                "type" text NOT NULL,
                "related_id" text NOT NULL,
                "read" boolean DEFAULT false NOT NULL,
                "created_at" timestamp DEFAULT now(),
                CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "karwei"."user"("id") ON DELETE no action ON UPDATE no action
            );
            `;
            console.log('Notification table created.');
        } catch (e) {
            console.log('Error creating notification table:', e.message);
        }

        await sql.end();
        console.log('Migration Done.');
    } catch (e) {
        console.error('Fatal error:', e);
        process.exit(1);
    }
}

main();
