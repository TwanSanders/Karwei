<script>
  import PostCard from "../../lib/ui/post_card.svelte";

  let user = {
    name: "Twan Sanders",
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
      <h1 class="text-3xl font-bold mt-4">{user.name}</h1>
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
        {#each Array(5) as _, index}
          <div class="carousel-item h-full">
            <PostCard
              title={`Magnetron ${index} is kaka`}
              description={"hij draait niet meer"}
              type={"Elektronica"}
            />
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
