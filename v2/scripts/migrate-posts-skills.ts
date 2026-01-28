
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import { postsTable, skillsTable } from '../src/lib/server/db/schema';


if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

async function migratePostSkills() {
    console.log('🔄 Starting Post Skills Migration (Name -> ID)...');

    // 1. Fetch all available skills
    const skills = await db.select().from(skillsTable);
    const skillMap = new Map<string, string>(); // Name (lowercase) -> ID

    skills.forEach(skill => {
        skillMap.set(skill.name.toLowerCase(), skill.id);
    });

    console.log(`📚 Loaded ${skills.length} skills from catalog.`);

    // 2. Fetch all posts
    const posts = await db.select().from(postsTable);
    console.log(`📝 Found ${posts.length} posts to check.`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const post of posts) {
        if (!post.type) {
            skippedCount++;
            continue;
        }

        // Check if type is already a UUID (rough check)
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(post.type);

        if (isUUID) {
            // Already migrated or correct
            skippedCount++;
            continue;
        }

        // Try to match by name
        const lowerName = post.type.toLowerCase();
        const skillId = skillMap.get(lowerName);

        if (skillId) {
            try {
                // Update the post
                await db.update(postsTable)
                    .set({ type: skillId })
                    .where(eq(postsTable.id, post.id));
                
                console.log(`✅ Migrated post "${post.title}": "${post.type}" -> ${skillId}`);
                updatedCount++;
            } catch (err) {
                console.error(`❌ Failed to update post ${post.id}`, err);
                errorCount++;
            }
        } else {
            console.warn(`⚠️  No matching skill found for post "${post.title}" with type "${post.type}"`);
            errorCount++;
        }
    }

    console.log('\n═══════════════════════════════════════');
    console.log('MIGRATION SUMMARY');
    console.log('═══════════════════════════════════════');
    console.log(`Total Posts:      ${posts.length}`);
    console.log(`Updated:          ${updatedCount}`);
    console.log(`Skipped (OK/Nil): ${skippedCount}`);
    console.log(`Unmatched/Err:    ${errorCount}`);
    console.log('═══════════════════════════════════════');
}

migratePostSkills()
    .then(async () => {
        await client.end();
        process.exit(0);
    })
    .catch(async (err) => {
        console.error('Migration Fatal Error:', err);
        await client.end();
        process.exit(1);
    });
