import { postsTable } from "$lib/server/schema/schema";
import { init } from "$lib/server/schema/init";
import { eq } from "drizzle-orm";

export const actions = {
  retreivePosts: async ({ request }) => {
    const formData = await request.formData();
    const userId = formData.get("user_id")?.toString();
    if (!userId) {
      return fail(400, { error: "User ID is required" });
    }
    const db = init();
    let query = db
      .select()
      .from(postsTable)
      .where(eq(postsTable.userId, userId));

    let posts = await query.execute();

    return posts;
  },
};
