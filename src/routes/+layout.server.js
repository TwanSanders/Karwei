import { usersTable } from "$lib/server/schema/schema";
import { and, eq } from "drizzle-orm";
import { init } from "$lib/server/schema/init";

export const load = async (event) => {
  const session = await event.locals.auth();

  if (session) {
    const db = init();

    let query = db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, session.user.email));

    let ids = await query.execute();

    if (ids.length > 0) {
      session.user.id = ids[0].id;
    }
  }
  return {
    session,
  };
};
