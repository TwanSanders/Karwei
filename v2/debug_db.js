import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

// Simple .env parser since dotenv might not be installed
function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf-8');
            const lines = content.split('\n');
            for (const line of lines) {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    const value = match[2].trim().replace(/^["']|["']$/g, '');
                    if (!process.env[key]) {
                        process.env[key] = value;
                    }
                }
            }
        }
    } catch (e) {
        console.error('Failed to load .env', e);
    }
}

loadEnv();

async function main() {
    let url = process.env.DATABASE_URL;
    if (!url) {
        console.log('DATABASE_URL not found in env, trying hardcoded...');
        url = "postgres://user:admin@localhost:5432/postgres";
    }
    console.log('Connecting to DB...');
    // Mask password
    console.log('URL:', url.replace(/:([^:@]+)@/, ':****@'));

    const sql = postgres(url);

    try {
        console.log('Checking karwei schema tables...');
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'karwei'
        `;
        console.log('Tables in karwei:', tables.map(t => t.table_name));

        const sessionColumns = await sql`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'karwei' AND table_name = 'session'
        `;
        console.log('Session columns:', sessionColumns);

        // Check if we can select from it
        try {
            const count = await sql`SELECT count(*) FROM "karwei"."session"`;
            console.log('Session count:', count[0].count);
        } catch (e) {
            console.error('Select failed:', e.message);
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await sql.end();
    }
}

main();
