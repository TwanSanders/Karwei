import { saltAndHashPassword } from "../services/auth";
import { init } from "./init";
import { usersTable } from "./schema";
import bcrypt from "bcryptjs";
import { object, string } from "zod";
import { eq } from "drizzle-orm";

export const registerSchema = object({
  name: string({ required_error: "Name is required" }).min(
    1,
    "Name is required"
  ),
  email: string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email"),
  password: string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    ),
});

/**
 * Get a user by their email
 *
 * @param {string} email - Email of the user to be retrieved
 * @returns {User} - User object if found, otherwise null. If password is wrong, we return false
 */
export async function getUserByEmail(email, password = null) {
  try {
    const db = init();

    const results = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    const user =
      Array.isArray(results) && results.length > 0 ? results[0] : null;
    if (!user) return null;

    if (password !== null) {
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) return false;
    }

    // Return a sanitized user object without sensitive fields
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Create a new user in the database
 *
 * @param {*} user - New user object to be inserted into the database
 * @returns {id: string} - Id of the newly created user
 */
export async function createUser(
  name,
  email,
  password,
  image,
  skills,
  bio,
  lat,
  long,
  maker
) {
  try {
    const user = registerSchema.parse({
      name,
      email,
      password,
    });
    const passwordHash = await bcrypt.hash(user.password, 10);

    // TODO - upload image to bucket
    const imageUrl = image ?? null;

    // coerce lat/long to numbers (or null) to match decimal DB precision
    const parsedLat =
      lat !== null && lat !== undefined ? parseFloat(lat) : null;
    const parsedLong =
      long !== null && long !== undefined ? parseFloat(long) : null;
    const safeLat = Number.isFinite(parsedLat) ? parsedLat : null;
    const safeLong = Number.isFinite(parsedLong) ? parsedLong : null;

    // if skills is an array (from formData.getAll), join to a string
    const safeSkills = Array.isArray(skills) ? skills.join(",") : skills;

    // Save user to database
    const db = init();
    const results = await db
      .insert(usersTable)
      .values({
        name: name,
        email: email,
        passwordHash: passwordHash,
        image: imageUrl,
        skills: safeSkills,
        lat: safeLat,
        long: safeLong,
        bio: bio,
        maker: maker,
      })
      .returning({ id: usersTable.id });

    return Array.isArray(results) && results.length > 0 ? results[0] : null;
  } catch (error) {
    throw error;
  }
}
