import { signOut } from "../../../lib/server/services/auth";
import { json } from "@sveltejs/kit";

export async function POST(event) {
  try {
    // Call the signOut function from your services
    console.log("signing out");
    await signOut(event, {
      redirectTo: null, // Try setting `redirectTo` to `null` to disable automatic redirection
    });

    return json({ success: true });
  } catch (error) {
    console.error("Error in sign-out endpoint:", error); // Log the error for debugging
    return json({ success: false, error: error.message }, { status: 500 });
  }
}
