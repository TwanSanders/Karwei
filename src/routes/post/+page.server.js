import { init } from "$lib/server/schema/init";
import {
  postsTable,
  usersTable,
  commentsTable,
} from "$lib/server/schema/schema";
import { eq, and, like } from "drizzle-orm";

export async function load({ url }) {
  let params = url.searchParams;
  let id = params.get("id");

  let post = await loadPost(id);
  post = post[0];

  let user = await loadUser(post.userId);
  user = user[0];

  let comments = await loadComments(id);

  let makers = await loadMakers(post.type);

  return { post: post, user: user, comments: comments, makers: makers };
}

async function loadMakers(type) {
  const db = init();
  let query = db
    .select()
    .from(usersTable)
    .where(
      and(eq(usersTable.maker, true), like(usersTable.skills, `%${type}%`))
    );

  let makers = await query.execute();

  return makers;
}

async function loadComments(postId) {
  const db = init();
  let query = db
    .select()
    .from(commentsTable)
    .innerJoin(usersTable, eq(commentsTable.userId, usersTable.id))
    .where(eq(commentsTable.postId, postId))
    .orderBy(commentsTable.createdAt, "desc");

  let comments = await query.execute();

  return comments || [];
}

async function loadPost(id) {
  const db = init();
  let query = db.select().from(postsTable).where(eq(postsTable.id, id));

  let post = await query.execute();

  return post || [];
}

async function loadUser(id) {
  const db = init();
  let query = db.select().from(usersTable).where(eq(usersTable.id, id));

  let user = await query.execute();

  return user || [];
}

export const actions = {
  sumbitComment: async ({ request }) => {
    const db = init();
    const formData = await request.formData();
    const userId = formData.get("user_id");
    const postId = formData.get("post_id");
    const message = formData.get("message");

    await db
      .insert(commentsTable)
      .values({
        userId: userId,
        postId: postId,
        message: message,
      })
      .execute();

    return { status: "success" };
  },
};
