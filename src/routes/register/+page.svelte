<script>
  import { get } from "svelte/store";
  import Selection from "../../lib/ui/selection.svelte";
  import "leaflet/dist/leaflet.css";

  let name = "";
  let email = "";
  let password = "";
  let error = "";

  let makerprofile = null;

  let lat = 50.7492012;
  let long = 4.2602021;

  async function getLocation() {
    if (makerprofile) {
      L = await import("leaflet");
      map = L.map("map").setView([lat, long], 13);
      var userMarker = L.marker([lat, long]).addTo(map);
      userMarker.bindPopup("<b>Your location</b>");

      let isDarkTheme = false;

      const tileLayerURL = isDarkTheme
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
        : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png";

      let tileLayer = L.tileLayer(tileLayerURL, {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://carto.com/attributions">Carto</a>, &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      }).addTo(map);

      await navigator.geolocation.getCurrentPosition(async function (location) {
        lat = location.coords.latitude;
        long = location.coords.longitude;

        map.setView([lat, long], 13);

        userMarker = L.marker([lat, long]).addTo(map);
        userMarker.bindPopup("<b>Your location</b>");
      });

      map.on("click", function (e) {
        if (userMarker) map.removeLayer(userMarker);
        lat = e.latlng.lat;
        long = e.latlng.lng;
        userMarker = L.marker(e.latlng).addTo(map);
      });
    }
  }

  async function register(event) {
    let form = event.target.form;

    const formData = new FormData(form);
    formData.append("lat", lat);
    formData.append("long", long);

    try {
      // Submit the form manually using fetch
      const response = await fetch("?/register", {
        method: "POST",
        body: formData,
      });

      console.log("Response status: ", response.status);

      let errordata = response.json();

      console.log(errordata);

      if (response.status == 200) {
        window.location.href = "/login";
      } else if (response.status == 400) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (error) {
      console.error(error);
    }
  }
</script>

<div class="flex items-center justify-center">
  <div class="card lg:card-side bg-base-100 shadow-xl max-w-screen-sm m-10">
    <div class="card-body">
      <h2 class="card-title">Register</h2>
      {#if error}
        <p class="text-red-500 text-center">{error}</p>
      {/if}
      <hr />

      <form method="POST">
        <div class="form-control w-full">
          <label class="label" for="name"><strong> Name</strong> </label>
          <input
            id="name"
            type="text"
            name="name"
            bind:value={name}
            placeholder="John Doe"
            class="input input-bordered w-full"
            required
          />
        </div>

        <div class="form-control w-full">
          <label class="label" for="email"><strong>Email</strong></label>
          <input
            id="email "
            type="email"
            name="email"
            bind:value={email}
            placeholder="example@email.com"
            class="input input-bordered w-full"
            required
          />
        </div>

        <div class="form-control w-full">
          <label class="label" for="password">
            <strong>Password</strong>
          </label>
          <input
            id="password"
            type="password"
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

        <p class="mt-4">
          Do you want other people to see you as a maker? We will need your
          location to display you on the map.
        </p>
        <div class="flex items-center">
          <label class="label cursor-pointer" for="yes"> Yes </label>
          <input
            type="radio"
            class="radio mr-5"
            id="yes"
            value="true"
            name="makerprofile"
            checked={false}
            on:click={() => {
              makerprofile = true;
              getLocation();
            }}
          />

          <label class="label cursor-pointer" for="No"> No </label>
          <input
            type="radio"
            class="radio"
            id="No"
            value="false"
            name="makerprofile"
            checked={false}
            on:click={() => {
              makerprofile = false;
            }}
          />
        </div>

        {#if makerprofile}
          <p class="mt-4"><strong>What are your skills?</strong></p>
          <ul>
            <Selection full={false} />
          </ul>
          <p class="mt-4"><strong>Bio</strong></p>
          <input
            name="bio"
            class="input input-bordered w-full"
            placeholder="I'm a maker that has a passion to repair and reuse things"
          />
          <p class="mt-4">
            <strong>Location</strong>
          </p>
          <div id="map" class="h-96 col-span-9 rounded-xl z-40"></div>
          <p class="text-gray-500 text-sm">
            Click on the map to move the marker
          </p>
        {:else if makerprofile === false}
          <p>:((</p>
        {/if}

        <button
          on:click={register}
          type="button"
          class="btn btn-primary w-full mt-6">Register</button
        >
      </form>

      <p class="text-center mt-4">
        Already have an account? <a href="/login" class="link link-primary"
          >Login</a
        >
      </p>
    </div>
  </div>
</div>
