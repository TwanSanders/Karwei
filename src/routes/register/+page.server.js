// src/routes/register/+page.server.ts

import { createUser } from "../../lib/server/schema/user";
import { fail, redirect } from "@sveltejs/kit";
import { error } from "@sveltejs/kit";

export const actions = {
  register: async ({ request }) => {
    const formData = await request.formData();
    const name = formData.get("name")?.toString();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    let skills = formData.getAll("type_select");
    let bio = formData.get("bio")?.toString();
    let lat = formData.get("lat");
    let long = formData.get("long");
    let maker = formData.get("makerprofile") === "true" ? true : false;

    if (!maker) {
      lat = null;
      long = null;
      bio = null;
      skills = null;
      maker = false;
    }

    if (!name || !email || !password) {
      console.log("field required");
      throw error(400, "All fields are required");
    }
    let newUser = null;
    try {
      newUser = await createUser(
        name,
        email,
        password,
        null,
        skills,
        bio,
        lat,
        long,
        maker
      ); // Pass in image if needed
    } catch (err) {
      console.log(err);
      throw error(400, "This is an error");
    }
    if (!newUser) {
      console.log("Failed to register user");
      throw error(400, "Failed to register user");
    }

    // Redirect on success
    throw redirect(303, "/login");
  },
};
