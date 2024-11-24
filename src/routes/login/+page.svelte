<script>
  import { signIn } from "@auth/sveltekit/client";

  let email = "";
  let password = "";
</script>

<div class="flex items-center justify-center">
  <div class="card lg:card-side bg-base-100 shadow-xl max-w-screen-sm m-10">
    <div class="card-body">
      <h2 class="card-title">Log In</h2>
      <hr />

      <form
        on:submit={() => {
          signIn("credentials", { email, password }).then(() => {
            window.location.href = "/";
          });
        }}
        class="mt-6"
      >
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

        <button type="submit" class="btn btn-primary w-full mt-6">Log In</button
        >
      </form>
    </div>
  </div>
</div>
