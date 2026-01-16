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
                // Handle potential quotes
                let val = line.split('=')[1].trim();
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

        console.log('Adding status column...');
        try {
            await sql`ALTER TABLE "karwei"."post" ADD COLUMN "status" text DEFAULT 'open' NOT NULL`;
            console.log('Status column added.');
        } catch (e) {
            console.log('Status column might already exist or error:', e.message);
        }

        console.log('Creating review table...');
        try {
            await sql`
            CREATE TABLE IF NOT EXISTS "karwei"."review" (
                "id" text PRIMARY KEY NOT NULL,
                "reviewer_id" text NOT NULL,
                "target_user_id" text NOT NULL,
                "post_id" text NOT NULL,
                "rating" numeric(2, 1) NOT NULL,
                "comment" text,
                "created_at" timestamp DEFAULT now(),
                CONSTRAINT "review_reviewer_id_user_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "karwei"."user"("id") ON DELETE no action ON UPDATE no action,
                CONSTRAINT "review_target_user_id_user_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "karwei"."user"("id") ON DELETE no action ON UPDATE no action,
                CONSTRAINT "review_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "karwei"."post"("id") ON DELETE no action ON UPDATE no action
            );
            `;
            console.log('Review table created.');
        } catch (e) {
             console.log('Error creating review table:', e.message);
        }

        await sql.end();
        console.log('Done.');
    } catch (e) {
        console.error('Fatal error:', e);
        process.exit(1);
    }
}

main();
