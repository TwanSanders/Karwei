<script>
  import { signIn } from "@auth/sveltekit/client";

  let email = "";
  let password = "";
</script>

<div class="flex flex-col items-center justify-center min-h-screen bg-gray-50">
  <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
    <h1 class="text-2xl font-semibold text-center text-gray-800">Log In</h1>

    <form
      on:submit={() => signIn("credentials", { email, password })}
      class="mt-6"
    >
      <div class="form-control w-full mt-4">
        <label class="label">
          <span class="label-text">Email</span>
        </label>
        <input
          type="email"
          name="email"
          bind:value={email}
          placeholder="example@email.com"
          class="input input-bordered w-full"
          required
        />
      </div>

      <div class="form-control w-full mt-4">
        <label class="label">
          <span class="label-text">Password</span>
        </label>
        <input
          type="password"
          name="password"
          bind:value={password}
          placeholder="********"
          class="input input-bordered w-full"
          required
        />
        <label class="label">
          <span class="label-text-alt"
            >Must be 8-32 characters, with uppercase, lowercase, number, and
            special character.</span
          >
        </label>
      </div>

      <button type="submit" class="btn btn-primary w-full mt-6">Log In</button>
    </form>
  </div>
</div>
