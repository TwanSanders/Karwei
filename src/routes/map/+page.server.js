import { init } from "$lib/server/schema/init";
import { usersTable } from "$lib/server/schema/schema";
import { or, eq, like } from "drizzle-orm";

export async function load({ url }) {
  const db = init();
  const query = db.select().from(usersTable).where(eq(usersTable.maker, true));

  const results = await query.execute();

  return { makers: results };
}

export const actions = {
  loadMakers: async ({ request }) => {
    const db = init();

    const formData = await request.formData();
    const selectedTypes = formData.getAll("type_select");

    let query = db.select().from(usersTable).where(eq(usersTable.maker, true));

    // Pas de query aan op basis van de geselecteerde types
    if (selectedTypes.length > 0) {
      query = query.where(
        or(...selectedTypes.map((type) => like(usersTable.skills, `%${type}%`)))
      );
    }

    let makers = await query.execute();

    console.log("Makers: ", makers);

    return makers;
  },
};
