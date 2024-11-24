import { postsTable } from "$lib/server/schema/schema";
import { usersTable } from "$lib/server/schema/schema";
import { init } from "$lib/server/schema/init";
import { eq } from "drizzle-orm";

export async function load({ url }) {
  const userId = url.searchParams.get("user_id")?.toString();
  if (!userId) {
    return { status: 400, body: { error: "User ID is required" } };
  }
  const db = init();

  let query_posts = db
    .select()
    .from(postsTable)
    .where(eq(postsTable.userId, userId));
  let posts = await query_posts.execute();

  let query_user = db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));
  let user = await query_user.execute();
  user = user[0];

  return {
    props: { posts, user },
  };
}
