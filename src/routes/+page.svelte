<script>
  import { longtext } from "drizzle-orm/mysql-core";
  import PostCard from "../lib/ui/post_card.svelte";
  export let data;
  import { enhance } from "$app/forms";
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

<div class="grid grid-cols-12 gap-4">
  <ul class="menu bg-base-200 rounded-box w-56 col-span-3 m-10">
    <form method="POST" use:enhance on:change={handleChange}>
      <li><strong>Type karwei</strong></li>
      <li>
        <label class="label cursor-pointer">
          <span class="label-text">Elektriciteit</span>
          <input
            type="checkbox"
            class="checkbox"
            name="type_select"
            value="Elektriciteit"
          />
        </label>
      </li>
      <li>
        <label class="label cursor-pointer">
          <span class="label-text">Huishoudelijke apparaten</span>
          <input
            type="checkbox"
            class="checkbox"
            name="type_select"
            value="Huishoudelijke apparaten"
          />
        </label>
      </li>
      <li>
        <label class="label cursor-pointer">
          <span class="label-text">Textiel</span>
          <input
            type="checkbox"
            class="checkbox"
            name="type_select"
            value="Textiel"
          />
        </label>
      </li>
      <li>
        <label class="label cursor-pointer">
          <span class="label-text">Hout</span>
          <input
            type="checkbox"
            class="checkbox"
            name="type_select"
            value="Hout"
          />
        </label>
      </li>
      <li>
        <label class="label cursor-pointer">
          <span class="label-text">Tuinonderhoud</span>
          <input
            type="checkbox"
            class="checkbox"
            name="type_select"
            value="Tuinonderhoud"
          />
        </label>
      </li>
      <li>
        <label class="label cursor-pointer">
          <span class="label-text">Elektronica</span>
          <input
            type="checkbox"
            class="checkbox"
            name="type_select"
            value="Elektronica"
          />
        </label>
      </li>
    </form>
  </ul>

  <div
    class="carousel carousel-vertical rounded-box h-96 col-span-9 m-10 scrollbar"
    bind:this={carousel}
  >
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
    {#if no_more_posts}
      <div class="carousel-item h-full">
        <div class="flex justify-center items-center h-full">
          <p>You've reached the end!</p>
        </div>
      </div>
    {:else}
      <div class="carousel-item h-full">
        <div class="flex justify-center items-center h-full">
          <input
            type="button"
            value="Load more"
            class="btn btn-primary"
            on:click={loadMore}
          />
        </div>
      </div>
    {/if}
  </div>
</div>
