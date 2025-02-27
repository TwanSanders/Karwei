import { postsTable, offersTable } from "$lib/server/schema/schema";
import { init } from "$lib/server/schema/init";
import { eq } from "drizzle-orm";

export const actions = {
  submitReview: async ({ request }) => {
    const formData = await request.formData();
    let score = formData.get("score");
    let postId = formData.get("post_id");
    let makerId = formData.get("maker_id");
    let offerId = formData.get("offer_id");

    console.log("final score", score);

    // maker_id en score toevoegen
    const db1 = init();
    await db1
      .update(postsTable)
      .set({
        score: score,
        makerId: makerId,
      })
      .where(eq(postsTable.id, postId))
      .execute();

    // offers verwijderen
    const db2 = init();
    await db2
      .delete(offersTable)
      .where(eq(offersTable.postId, postId))
      .execute();

    return { status: "success" };
  },
};
