<script>
  import { signIn } from "@auth/sveltekit/client";
  import { goto } from "$app/navigation";

  let email = "";
  let password = "";
  let error = "";
  let submitting = false;

  async function handleSubmit(e) {
    e.preventDefault();
    error = "";
    submitting = true;
    try {
      // Prevent automatic redirect from the auth client so we can handle errors
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        // Map known server error messages or provider error codes to friendlier UI text
        const friendly = {
          "Invalid credentials.": "Incorrect email or password.",
          "Email address not found, please register before logging in.":
            "Email not found — please register first.",
          // @auth / NextAuth-style provider error code when credentials fail
          CredentialsSignin: "Incorrect email or password.",
        };

        error = friendly[res.error] ?? res.error ?? "Login failed";
        submitting = false;
        return;
      }

      // Successful sign in
      await goto("/");
    } catch (err) {
      error = err?.message ?? "Unexpected error";
      submitting = false;
    }
  }
</script>

<div class="flex items-center justify-center">
  <div class="card lg:card-side bg-base-100 shadow-xl max-w-screen-sm m-10">
    <div class="card-body">
      <h2 class="card-title">Log In</h2>
      <hr />

      <form on:submit={handleSubmit} class="mt-6">
        <div class="form-control w-full">
          <label class="label" for="email">
            <span class="label-text">Email</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            bind:value={email}
            placeholder="example@email.com"
            class="input input-bordered w-full"
            required
          />
        </div>

        <div class="form-control w-full mt-4">
          <label class="label" for="password">
            <span class="label-text">Password</span>
          </label>
          <input
            type="password"
            id="password"
            name="password"
            bind:value={password}
            placeholder="********"
            class="input input-bordered w-full"
            required
          />
          <span class="label-text-alt"
            >Must be 8-32 characters, with uppercase, lowercase, number, and
            special character.</span
          >
        </div>

        {#if error}
          <p class="text-sm text-red-600 mt-2">{error}</p>
        {/if}

        <button
          type="submit"
          class="btn btn-primary w-full mt-6"
          disabled={submitting}
        >
          {#if submitting}
            Logging in...
          {:else}
            Log In
          {/if}
        </button>
      </form>
    </div>
  </div>
</div>
