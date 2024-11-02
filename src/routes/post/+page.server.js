import { init } from "$lib/server/schema/init";
import { postsTable } from "$lib/server/schema/schema";
import { eq } from "drizzle-orm";

export async function load({ url }) {
  let params = url.searchParams;
  let id = params.get("id");

  let post = await loadPost(id);

  return { post: post };
}

async function loadPost(id) {
  const db = init();
  let query = db.select().from(postsTable).where(eq(postsTable.id, id));

  let post = await query.execute();

  return post || [];
}
