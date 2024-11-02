import { init } from "$lib/server/schema/init";
import { postsTable } from "$lib/server/schema/schema";
import { redirect } from "@sveltejs/kit";

export const actions = {
  default: async ({ cookies, request }) => {
    const db = init(); // Initialize the db inside the function

    // Get form data
    const data = await request.formData();

    // Retrieve the form values
    const title = data.get("title");
    const description = data.get("description");
    const purchasedAt = data.get("purchased_at");
    const type = data.get("type");
    const target_price = data.get("price");
    const user_id = "18676c6e-c0e1-41da-929b-b169a28080f0";
    console.log("Form Data:", {
      title,
      description,
      purchasedAt,
      user_id,
      target_price,
      type,
    });

    // const result = await db.select().from("user");
    //console.log(result);

    // Insert data into postsTable
    await db.insert(postsTable).values({
      userId: user_id,
      title: title,
      description: description,
      purchasedAt: new Date(purchasedAt),
      type: type,
      targetPrice: parseFloat(target_price),
    });

    throw redirect(303, "../ ");
  },
};
