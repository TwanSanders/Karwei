import { SvelteKitAuth } from "@auth/sveltekit";
import Credentials from "@auth/sveltekit/providers/credentials";
import { getUserByEmail } from "../schema/user";

export const { signIn, signOut, handle } = SvelteKitAuth({
  providers: [
    Credentials({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        let user = null;

        // logic to verify if user exists
        console.log("credentials", credentials.email, credentials.password);
        user = await getUserByEmail(credentials.email, credentials.password);
        console.log("userResult", user);
        if (user === false) {
          throw new Error("Invalid credentials.");
        } else if (user === null) {
          throw new Error(
            "Email address not found, please register before logging in."
          );
        }

        // return JSON object with the user data
        return user;
      },
    }),
  ],
});
