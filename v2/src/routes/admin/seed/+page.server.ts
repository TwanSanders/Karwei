
import { db } from '$lib/server/db';
import { usersTable, postsTable } from '$lib/server/db/schema';
import { sql } from 'drizzle-orm';

export const load = async () => {
    // Belgium Bounds
    // Lat: 49.5 -> 51.5
    // Long: 2.5 -> 6.4

    const getRandomInRange = (from: number, to: number, fixed: number) => {
        return (Math.random() * (to - from) + from).toFixed(fixed);
    };

    // Update Users
    const users = await db.select().from(usersTable);
    let updatedUsers = 0;
    for (const user of users) {
        const lat = getRandomInRange(49.5, 51.5, 6);
        const long = getRandomInRange(2.5, 6.4, 6);
        
        await db.update(usersTable)
            .set({ 
                lat: sql`${lat}`, 
                long: sql`${long}` 
            })
            .where(sql`${usersTable.id} = ${user.id}`);
        updatedUsers++;
    }

    // Update Posts (give them their user's location or a new random one nearby)
    const posts = await db.select().from(postsTable);
    let updatedPosts = 0;
    for (const post of posts) {
        // Find owner to put it near them, or just random belgium for now for simplicity as per request
        const lat = getRandomInRange(49.5, 51.5, 6);
        const long = getRandomInRange(2.5, 6.4, 6);

        await db.update(postsTable)
            .set({ 
                lat: sql`${lat}`, 
                long: sql`${long}` 
            })
            .where(sql`${postsTable.id} = ${post.id}`);
        updatedPosts++;
    }

    return {
        success: true,
        stats: {
            updatedUsers,
            updatedPosts
        }
    };
};
