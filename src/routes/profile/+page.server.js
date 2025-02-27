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

  let query_rating = db
    .select()
    .from(postsTable)
    .where(eq(postsTable.makerId, userId));
  let fixedPosts = await query_rating.execute();
  let rating = 0;
  let count = 0;
  fixedPosts.forEach((post) => {
    if (post.score) {
      rating += post.score;
      count++;
    }
  });
  rating = rating / count;
  console.log("rating", rating);

  return {
    props: { posts, user, rating },
  };
}
