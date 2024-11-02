// import { signIn } from "../../lib/ui/services/auth";
// import { fail, redirect } from "@sveltejs/kit";

// export const actions = {
//   login: async (event) => {
//     const formData = await event.request.formData();
//     const email = formData.get("email")?.toString();
//     const password = formData.get("password")?.toString();
//     console.log(formData);

//     if (!email || !password) {
//       return fail(400, { error: "All fields are required" });
//     }

//     try {
//       const result = await signIn("credentials", event);
//       console.log("result", result);

//       if (!result) {
//         return fail(400, { error: "Failed to login user" });
//       }

//       // Redirect on success
//       throw redirect(303, "/");
//     } catch (error) {
//       console.error(error);
//       return fail(500, { error: "An error occurred during registration" });
//     }
//   },
// };
