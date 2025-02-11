import { postsTable } from "$lib/server/schema/schema";
import { usersTable } from "$lib/server/schema/schema";
import { init } from "$lib/server/schema/init";
import { eq } from "drizzle-orm";

export const actions = {
  submitReview: async ({ request }) => {
    const formData = await request.formData();
    let score = formData.get("score");

    console.log("final score", score);

    // Aanmaken van Nieuwe tabel offers en deze opvragen uit de database

    //In reviewpagina controleren op correcte userd_id

    //Nieuwe tabel aanmaken: finished posts (alle post info + maker_id + score)

    //Post verwijderen uit posts en toevoegen aan finished posts

    return { status: "success" };
  },
};
