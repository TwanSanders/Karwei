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
        user = await getUserByEmail(credentials.email, credentials.password);

        // The Credentials provider expects `null` on failure. Throwing an Error
        // here results in a 500 Internal Server Error. Return `null` so the
        // client receives a proper authentication failure response.
        if (user === false || user === null) {
          return null;
        }

        // Ensure passwordHash isn't leaked in the session
        if (user && typeof user === "object") {
          const { passwordHash, ...safeUser } = user;
          return safeUser;
        }
        return null;
      },
    }),
  ],
});
