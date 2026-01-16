import 'dotenv/config';
import postgres from 'postgres';

async function main() {
    if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL is not set');
        process.exit(1);
    }
    const sql = postgres(process.env.DATABASE_URL);

    try {
        const result = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'karwei' 
            AND table_name = 'post';
        `;
        console.log('Columns in karwei.post:', result);
    } catch (e) {
        console.error(e);
    }
    await sql.end();
    process.exit(0);
}

main();
