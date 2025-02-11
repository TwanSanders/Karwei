<script>
  import { getContext, onMount } from "svelte";
  import "leaflet/dist/leaflet.css";

  export let data;
  const session = getContext("session");

  let post = data.post || {};
  let user = data.user || {};
  let comments = data.comments || [];
  let makers = data.makers || [];
  let message = "";
  let offers = [
    {
      id: 1,
      name: "Manno Vanherck",
      description:
        "Ik wil deze gerust maken! Je mag hem opsturen naar Heldenhuldelaan 24.",
      price: "35",
    },
  ];
  const date = new Date(post.purchasedAt);

  async function submitComment(event) {
    const form = event.target.form;
    const formData = new FormData(form);
    formData.append("post_id", post.id);
    formData.append("user_id", session.user.id);
    formData.append("message", message);

    try {
      // Submit the form manually using fetch
      const response = await fetch("?/sumbitComment", {
        method: "POST",
        body: formData,
      });

      // Parse the response and update posts
      const result = await response.json();

      if (response.status == 200) {
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
    }
  }

  let lat = 50.7492012;
  let long = 4.2602021;

  async function LoadMap() {
    L = await import("leaflet");
    map = L.map("map").setView([lat, long], 8);

    await navigator.geolocation.getCurrentPosition(async function (location) {
      lat = location.coords.latitude;
      long = location.coords.longitude;

      map.setView([lat, long], 8);

      let userMarker = L.marker([lat, long], {
        icon: L.divIcon({
          className: "custom-ball-icon",
          html: `<div style="
          width: 15px;
          height: 15px;
          background-color: red;
          border-radius: 50%;
          border: 2px solid black;
        "></div>`,
          iconSize: [12, 12], // Adjust the size if needed
          iconAnchor: [6, 6], // Center the icon on the coordinates
        }),
      }).addTo(map);
      userMarker.bindPopup("<b>Your location</b>");
    });

    makers.forEach((maker) => {
      var makerMarker = L.marker([maker.lat, maker.long]).addTo(map);
      makerMarker.bindPopup(
        `<a href="../profile?user_id=${maker.id}">${maker.name}</a>`
      );
    });

    let isDarkTheme = false;

    const tileLayerURL = isDarkTheme
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
      : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png";

    let tileLayer = L.tileLayer(tileLayerURL, {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://carto.com/attributions">Carto</a>, &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    }).addTo(map);
  }

  onMount(() => {
    LoadMap();
  });
</script>

<div class="grid grid-cols-12">
  <div class="col-span-4 p-10">
    <div class="card card-compact bg-base-100 shadow-xl">
      <figure>
        <img src="img\magnetron.jpg" alt="Magnetron" />
      </figure>
      <div class="card-body">
        <h2 class="card-title">{post.title}</h2>
        <strong>Description</strong>
        <p>{post.description}</p>
        <div class="card-actions justify-end">
          <div class="badge badge-outline">{post.type}</div>
        </div>
      </div>
    </div>
  </div>
  <div class="col-span-3 p-10">
    <div class="card card-compact bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">About this post</h2>
        <strong>Target price</strong>
        <p>€{post.targetPrice}</p>
        <strong>Bought at</strong>
        <p>
          {date.toLocaleDateString("en-GB", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
    </div>
    <a href="../profile?user_id={post.userId}">
      <div class="card card-compact bg-base-100 shadow-xl mt-5">
        <div class="card-body">
          <h2 class="card-title">Contact</h2>
          <strong>User</strong>
          <p>{user.name}</p>
          <strong>Email</strong>
          <a
            href="mailto:{user.email}"
            class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
            >{user.email}</a
          >
          <strong>Phone</strong>
          <p>+32 485 00 87 34</p>
        </div>
      </div>
    </a>
  </div>
  <div class="col-span-5 p-10">
    {#if session.user.id == user.id}
      <div class="card card-compact bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">People near you who can fix this</h2>
          <div id="map" class="h-96 col-span-9 rounded-xl z-40"></div>
        </div>
      </div>
    {:else}
      <div class="card card-compact bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Make an offer</h2>
          <strong>Price</strong>
          <input name="price" class="input input-bordered" />
          <strong>Description</strong>
          <textarea name="description" class="textarea textarea-bordered"
          ></textarea>
          <button type="button" class="btn btn-primary w-full mt-6"
            >Offer</button
          >
        </div>
      </div>
    {/if}
  </div>

  <div class="card card-compact bg-base-100 shadow-xl m-10 col-span-12">
    <div class="card-body">
      <h2 class="card-title">Forum</h2>
      <hr />
      {#each comments as comment}
        <div
          class="chat {session && session.user.id === comment.user.id
            ? 'chat-end'
            : 'chat-start'}"
        >
          <div class="chat-image avatar">
            <div class="w-10 rounded-full">
              <img
                alt="Tailwind CSS chat bubble component"
                src={session && session.user.id === comment.user.id
                  ? "img/FotoNYC.jpg"
                  : "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"}
              />
            </div>
          </div>
          <div class="chat-header">
            {comment.user.name}
          </div>
          <div class="chat-footer">
            <time class="text-xs opacity-50"
              >{new Date(comment.comment.createdAt).toLocaleString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}</time
            >
          </div>
          <div class="chat-bubble">{comment.comment.message}</div>
        </div>
      {/each}
      {#if session}
        <div class="relative w-full">
          <form method="POST" on:enterkeyhint:{submitComment}>
            <input
              name="message"
              type="message"
              id="message"
              class="input input-bordered w-full pl-12 pr-12"
              placeholder={comments.length === 0
                ? "Be the first to comment on this post!"
                : "Type your message here..."}
              bind:value={message}
            />
            <!-- Verzenden Button -->
            <button
              class="absolute inset-y-0 right-0 flex items-center px-3 text-gray-600 hover:text-gray-800"
              on:click={submitComment}
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-send"
                viewBox="0 0 16 16"
              >
                <path
                  d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z"
                />
              </svg>
            </button>
            <!-- Afbeelding Button -->
            <input type="file" name="image" id="image" class="hidden" />
            <label
              for="image"
              class="absolute inset-y-0 left-0 flex items-center px-3 text-gray-600 hover:text-gray-800"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-file-image"
                viewBox="0 0 16 16"
              >
                <path d="M8.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0" />
                <path
                  d="M12 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2M3 2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v8l-2.083-2.083a.5.5 0 0 0-.76.063L8 11 5.835 9.7a.5.5 0 0 0-.611.076L3 12z"
                />
              </svg>
            </label>
          </form>
        </div>
      {/if}
    </div>
  </div>
  {#if session.user.id == user.id}
    <div class="card card-compact bg-base-100 shadow-xl m-10 col-span-12">
      <div class="card-body">
        <h2 class="card-title">Pending offers</h2>
        <hr />
        {#if offers.length === 0}
          <p>There are no offers yet.</p>
        {/if}
        {#each offers as offer}
          <div class="border p-2 rounded-lg flex justify-between items-center">
            <div>
              <p><strong>Name: </strong>{offer.name}</p>
              <p>
                <strong>Description: </strong>{offer.description}
              </p>
              <p><strong>Price: </strong>€{offer.price}</p>
            </div>
            <button
              type="button"
              class="btn btn-primary w-1/4"
              on:click={() => {
                window.location.href = `/review?offer_id${offer.id}`;
              }}>Karwei finished!</button
            >
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
