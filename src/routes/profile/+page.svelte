<script>
  import PostCard from "../../lib/ui/post_card.svelte";
  import { getContext, onMount } from "svelte";

  export let data;
  let posts = data.props.posts || [];
  let user = data.props.user || {};
  let rating = data.props.rating || 0;

  // Retrieve session from context
  const session = getContext("session");
  console.log(user);
  user.skills = user.skills.split(",");
  user.title = "Karwei maker";
</script>

<div class="grid grid-cols-12">
  <div class="col-span-6">
    <div class="m-8">
      <!-- Avatar -->
      <div class="avatar">
        <div class="w-24 mask rounded">
          <img
            bind:this={avatarEl}
            src="img\FotoNYC.jpg"
            alt="Pipi"
            loading="lazy"
            class="transition-all duration-300 ease-out blur-lg"
          />
        </div>
      </div>

      <script>
        let avatarEl;
        onMount(() => {
          if (avatarEl && avatarEl.complete) {
            avatarEl.classList.remove("blur-lg");
          }
        });
      </script>

      <!-- User Info -->
      <div class="flex items-baseline">
        <h1 class="text-3xl font-bold mr-5">{user.name}</h1>
        <div class="flex items-center">
          <p class="mr-2">{rating}</p>
          {#each Array(5) as _, i}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill={i < Math.floor(rating) ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
              class="w-5 h-5"
              color="orange"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
              />
            </svg>
          {/each}
        </div>
      </div>
      <p class="text-gray-500">{user.title}</p>
    </div>
    <!-- Bio -->
    <div class="card bg-base-100 shadow-xl m-8">
      <div class="card-body">
        <h2 class="card-title">Bio</h2>
        <p>{user.bio}</p>
      </div>
    </div>

    <!-- Skills -->
    <div class="card bg-base-100 shadow-xl m-8">
      <div class="card-body">
        <h2 class="card-title">Skills</h2>
        <div class="flex flex-wrap gap-2 mt-2">
          {#each user.skills as skill}
            <div class="badge badge-primary">{skill}</div>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <div class="card bg-base-100 shadow-xl m-8 col-span-6">
    <div class="card-body">
      <h2 class="card-title">{user.name}'s Karwei's</h2>
      <hr />
      <div class="carousel carousel-vertical rounded-box h-96 scrollbar">
        {#if posts.length === 0}
          <p class="m-2">This user hasn't posted yet...</p>
        {:else}
          {#each posts as post}
            <div class="carousel-item h-full">
              <PostCard
                title={post.title}
                description={post.description}
                type={post.type}
                id={post.id}
              />
            </div>
          {/each}
        {/if}
      </div>
    </div>
  </div>
</div>
