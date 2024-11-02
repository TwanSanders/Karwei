import { init } from "$lib/server/schema/init";
import { usersTable } from "$lib/server/schema/schema";
import { postsTable } from "$lib/server/schema/schema";
import { eq, or } from "drizzle-orm";

const limit = 2;

export async function load({ url }) {
  const posts = await loadPosts(url); // Ensure posts is properly awaited and returned
  return {
    props: { posts },
  };
}

async function loadPosts(url) {
  const db = init();
  const geselecteerdeTypes = url.searchParams.getAll("type_select");

  let query = db.select().from(postsTable).limit(limit).offset(0);

  // Pas de query aan op basis van de geselecteerde types
  if (geselecteerdeTypes.length > 0) {
    query = query.where(
      or(...geselecteerdeTypes.map((type) => eq(postsTable.type, type)))
    );
  }

  let posts = await query.execute();

  return posts || [];
}

export const actions = {
  loadPosts: async ({ request }) => {
    const db = init();

    const formData = await request.formData();
    const selectedTypes = formData.getAll("type_select");
    const offset = formData.get("page") * limit;

    let query = db.select().from(postsTable).limit(limit).offset(offset);

    // Pas de query aan op basis van de geselecteerde types
    if (selectedTypes.length > 0) {
      query = query.where(
        or(...selectedTypes.map((type) => eq(postsTable.type, type)))
      );
    }

    let posts = await query.execute();

    return posts;
  },
};
