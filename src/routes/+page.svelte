<script>
  import { longtext } from "drizzle-orm/mysql-core";
  import PostCard from "../lib/ui/post_card.svelte";
  export let data;
  import { enhance } from "$app/forms";
  import Selection from "../lib/ui/selection.svelte";
  let posts = data.props.posts || [];

  const limit = posts.length;

  let carousel;

  let page = 0;

  let form;

  let no_more_posts = false;

  let carouselobject;

  async function handleChange(event) {
    form = event.target.form;

    page = 0;
    no_more_posts = false;

    const formData = new FormData(form);
    formData.append("page", page);

    try {
      // Submit the form manually using fetch
      const response = await fetch("?/loadPosts", {
        method: "POST",
        body: formData,
      });

      // Parse the response and update posts
      const result = await response.json();
      data = JSON.parse(result.data);

      posts = data
        .filter((item) => {
          return (
            typeof item === "object" &&
            item !== null &&
            "id" in item &&
            "title" in item &&
            "description" in item
          );
        })
        .map((item) => {
          return {
            id: data[item.id],
            title: data[item.title],
            description: data[item.description],
            imageUrl: data[item.imageUrl],
            purchasedAt: new Date(data[item.purchasedAt]),
            createdAt: new Date(data[item.createdAt]),
            type: data[item.type],
            targetPrice: data[item.targetPrice],
            userId: data[item.userId],
          };
        });

      carousel.scrollTop = 0;
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  }

  async function loadMore() {
    const formData = new FormData(form);
    page += 1;
    formData.append("page", page);

    try {
      // Submit the form manually using fetch
      const response = await fetch("?/loadPosts", {
        method: "POST",
        body: formData,
      });

      // Parse the response and update posts
      const result = await response.json();
      data = JSON.parse(result.data);

      let previous_posts_count = posts.length;

      let new_posts = data
        .filter((item) => {
          return (
            typeof item === "object" &&
            item !== null &&
            "id" in item &&
            "title" in item &&
            "description" in item
          );
        })
        .map((item) => {
          return {
            id: data[item.id],
            title: data[item.title],
            description: data[item.description],
            imageUrl: data[item.imageUrl],
            purchasedAt: new Date(data[item.purchasedAt]),
            createdAt: new Date(data[item.createdAt]),
            type: data[item.type],
            targetPrice: data[item.targetPrice],
            userId: data[item.userId],
          };
        });

      if (new_posts != undefined && new_posts.length > 0) {
        posts = [...posts, ...new_posts];
        carouselobject = document.querySelector(".carousel");
        const newPost = carouselobject.children[previous_posts_count - 1];
        newPost.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "start",
        });
      } else {
        page -= 1;
        no_more_posts = true;
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  }
</script>

<div class="grid grid-cols-12">
  <div class="col-span-3 m-10">
    <form method="POST" use:enhance on:change={handleChange}>
      <Selection full={true} />
    </form>
  </div>

  <div class="col-span-9 m-10">
    <div class="space-y-6" bind:this={carousel}>
      {#each posts as post}
        <div>
          <PostCard
            title={post.title}
            description={post.description}
            type={post.type}
            id={post.id}
          />
        </div>
      {/each}
    </div>

    <div class="flex justify-center mt-8">
      {#if no_more_posts}
        <p class="text-sm text-slate-600">You've reached the end!</p>
      {:else}
        <input
          type="button"
          value="Load more"
          class="btn btn-primary"
          on:click={loadMore}
        />
      {/if}
    </div>
  </div>
</div>
