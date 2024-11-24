<script>
  import { onMount } from "svelte";
  import "leaflet/dist/leaflet.css";
  import Selection from "../../lib/ui/selection.svelte";
  import { enhance } from "$app/forms";

  export let data;
  let makers = data.makers;

  var map;
  let L;
  let isDarkTheme;
  let tileLayer;

  onMount(async () => {
    isDarkTheme =
      document.documentElement.getAttribute("data-theme") === "dark";

    map = await CreateMap();

    const observer = new MutationObserver(() => {
      isDarkTheme =
        document.documentElement.getAttribute("data-theme") === "dark";
      setTileLayer(isDarkTheme);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    await navigator.geolocation.getCurrentPosition(async function (location) {
      let lat = location.coords.latitude;
      let long = location.coords.longitude;

      map.setView([lat, long], 13);

      const userMarker = L.marker([lat, long], {
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
  });

  async function CreateMap() {
    let lat = 50.7492012;
    let long = 4.2602021;

    L = await import("leaflet");
    map = L.map("map").setView([lat, long], 13);

    setTileLayer(isDarkTheme);

    updateMakers();

    return map;
  }

  function setTileLayer(isDarkTheme) {
    if (tileLayer) {
      map.removeLayer(tileLayer); // Remove existing layer
    }

    const tileLayerURL = isDarkTheme
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
      : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png";

    tileLayer = L.tileLayer(tileLayerURL, {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://carto.com/attributions">Carto</a>, &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    }).addTo(map);
  }

  async function handleChange(event) {
    let form = event.target.form;

    const formData = new FormData(form);

    console.log(formData);

    try {
      // Submit the form manually using fetch
      const response = await fetch("?/loadMakers", {
        method: "POST",
        body: formData,
      });

      console.log(response);

      // Parse the response and update posts
      const result = await response.json();
      data = JSON.parse(result.data);

      makers = data
        .filter((item) => {
          return (
            typeof item === "object" &&
            item !== null &&
            "id" in item &&
            "name" in item
          );
        })
        .map((item) => {
          return {
            id: data[item.id],
            name: data[item.name],
            lat: data[item.lat],
            long: data[item.long],
          };
        });
      updateMakers();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  }

  async function updateMakers() {
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    for (const maker of makers) {
      var marker = L.marker([maker.lat, maker.long]).addTo(map);
      marker.bindPopup(
        `<a href="../profile?user_id=${maker.id}">${maker.name}</a>`
      );
    }
  }
</script>

<div class="grid grid-cols-12">
  <div class="col-span-3 m-10">
    <form method="POST" use:enhance on:change={handleChange}>
      <Selection full={true} />
    </form>
  </div>
  <div id="map" class="h-96 col-span-9 m-10 rounded-xl z-40"></div>
</div>
