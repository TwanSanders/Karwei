import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { usersTable, skillsTable, usersToSkillsTable } from '../src/lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

// Use process.env instead of SvelteKit's $env
if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

interface MigrationStats {
    totalUsers: number;
    usersProcessed: number;
    skillsCreated: number;
    skillsSkipped: number;
    errors: Array<{ userId: string; skill: string; reason: string }>;
}

async function migrateSkillsData() {
    const stats: MigrationStats = {
        totalUsers: 0,
        usersProcessed: 0,
        skillsCreated: 0,
        skillsSkipped: 0,
        errors: []
    };

    console.log('🔄 Starting skills migration...\n');

    // 1. Fetch all skills from skillsTable for lookup
    const allSkills = await db.select().from(skillsTable);
    const skillMap = new Map(allSkills.map(s => [s.name.toLowerCase().trim(), s.id]));
    
    console.log(`📦 Loaded ${allSkills.length} skills from database\n`);

    // 2. Fetch all users with skills
    const users = await db.select().from(usersTable);
    stats.totalUsers = users.length;
    
    console.log(`👥 Found ${users.length} users to process\n`);

    for (const user of users) {
        if (!user.skills || user.skills.trim() === '') {
            stats.usersProcessed++;
            continue;
        }

        // Parse comma-separated skills
        const userSkills = user.skills
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);

        for (const skillName of userSkills) {
            const normalizedName = skillName.toLowerCase().trim();
            const skillId = skillMap.get(normalizedName);

            if (!skillId) {
                // Skill doesn't exist in skillsTable
                stats.skillsSkipped++;
                stats.errors.push({
                    userId: user.id,
                    skill: skillName,
                    reason: `Skill "${skillName}" not found in skillsTable`
                });
                console.warn(`⚠️  User ${user.email}: Skill "${skillName}" not found`);
                continue;
            }

            try {
                // Insert into junction table (ignore duplicates)
                await db.insert(usersToSkillsTable)
                    .values({ userId: user.id, skillId })
                    .onConflictDoNothing();
                
                stats.skillsCreated++;
            } catch (error: any) {
                stats.errors.push({
                    userId: user.id,
                    skill: skillName,
                    reason: `Database error: ${error.message}`
                });
                console.error(`❌ Error inserting skill for user ${user.email}:`, error);
            }
        }

        stats.usersProcessed++;
        
        // Progress indicator
        if (stats.usersProcessed % 10 === 0) {
            console.log(`   Processed ${stats.usersProcessed}/${stats.totalUsers} users...`);
        }
    }

    // 3. Print Migration Summary
    console.log('\n✅ Migration Complete!\n');
    console.log('═══════════════════════════════════════');
    console.log('MIGRATION SUMMARY');
    console.log('═══════════════════════════════════════');
    console.log(`Total Users:          ${stats.totalUsers}`);
    console.log(`Users Processed:      ${stats.usersProcessed}`);
    console.log(`Skills Created:       ${stats.skillsCreated}`);
    console.log(`Skills Skipped:       ${stats.skillsSkipped}`);
    console.log(`Errors:               ${stats.errors.length}`);
    console.log('═══════════════════════════════════════\n');

    if (stats.errors.length > 0) {
        console.log('⚠️  ERRORS ENCOUNTERED:\n');
        stats.errors.forEach((err, idx) => {
            console.log(`${idx + 1}. User: ${err.userId}`);
            console.log(`   Skill: "${err.skill}"`);
            console.log(`   Reason: ${err.reason}\n`);
        });
    }

    return stats;
}

// Run migration
migrateSkillsData()
    .then(async () => {
        console.log('✅ Migration script finished');
        await client.end();
        process.exit(0);
    })
    .catch(async (error) => {
        console.error('❌ Migration failed:', error);
        await client.end();
        process.exit(1);
    });
