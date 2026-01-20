import fs from 'fs';
import postgres from 'postgres';

async function main() {
    try {
        const sqlFile = process.argv[2];
        if (!sqlFile) {
            console.error('Please provide a SQL file path');
            process.exit(1);
        }

        console.log(`Applying ${sqlFile}...`);
        const sqlContent = fs.readFileSync(sqlFile, 'utf-8');

        console.log('Reading .env...');
        const env = fs.readFileSync('.env', 'utf-8');
        let dbUrl = '';
        const lines = env.split('\n');
        for (const line of lines) {
            if (line.trim().startsWith('DATABASE_URL=')) {
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

        console.log('Executing SQL...');
        try {
            await sql.unsafe(sqlContent); // Use unsafe for raw SQL string
            console.log('Migration applied successfully.');
        } catch (e) {
            console.error('Error executing SQL:', e);
        }

        await sql.end();
        console.log('Done.');
    } catch (e) {
        console.error('Fatal error:', e);
        process.exit(1);
    }
}

main();
