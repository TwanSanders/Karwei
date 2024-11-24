<script>
  import PostCard from "../../lib/ui/post_card.svelte";

  import { getContext } from "svelte";

  import { onMount } from "svelte";

  // Retrieve session from context
  const session = getContext("session");

  let user = session.user;

  user = {
    ...user,
    title: "",
    bio: "Enthousiast doe-het-zelver, gepassioneerd door reparatie en hergebruik",
    avatar: "https://via.placeholder.com/150",
    skills: [
      "Elektriciteit",
      "Huishoudelijke apparaten",
      "Elektronica",
      "Tuinonderhoud",
    ],
  };

  let posts = [];

  async function retreivePosts() {
    let formdata = new FormData();
    formdata.append("user_id", user.id);

    const response = await fetch("?/retreivePosts", {
      method: "POST",
      body: formdata,
    });

    const result = await response.json();
    let data = JSON.parse(result.data);

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
  }

  onMount(() => {
    retreivePosts();
  });
</script>

<div class="grid grid-cols-12">
  <div class="col-span-6">
    <div class="m-8">
      <!-- Avatar -->
      <div class="avatar">
        <div class="w-24 mask rounded">
          <img src="img\FotoNYC.jpg" alt="Pipi" />
        </div>
      </div>

      <!-- User Info -->
      <div class="flex">
        <h1 class="text-3xl font-bold">
          {user.name}
        </h1>
        <img src="img/edit.png" alt="edit" title="edit" class="ml-5 size-9" />
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
      <h2 class="card-title">My Karwei's</h2>
      <hr />
      <div class="carousel carousel-vertical rounded-box h-96 scrollbar">
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
      </div>
    </div>
  </div>
</div>
