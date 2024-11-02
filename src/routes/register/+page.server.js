// src/routes/register/+page.server.ts

import { createUser } from "../../lib/server/schema/user";
import { fail, redirect } from "@sveltejs/kit";

export const actions = {
  register: async ({ request }) => {
    const formData = await request.formData();
    const name = formData.get("name")?.toString();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    if (!name || !email || !password) {
      return fail(400, { error: "All fields are required" });
    }

    try {
      let newUser = null;
      try {
        newUser = await createUser(name, email, password, null); // Pass in image if needed
      } catch (error) {
        return fail(400, { error: error.message });
      }
      if (!newUser) {
        return fail(400, { error: "Failed to register user" });
      }

      // Redirect on success
      throw redirect(303, "/login");
    } catch (error) {
      console.error(error);
      return fail(500, { error: "An error occurred during registration" });
    }
  },
};
