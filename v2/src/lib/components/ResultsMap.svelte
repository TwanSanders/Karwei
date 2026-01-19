<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { browser } from "$app/environment";

    export let items: any[] = []; // Can be Posts or Makers
    export let type: "posts" | "makers" = "posts";
    export let userLat: number | null = null;
    export let userLong: number | null = null;

    let mapElement: HTMLElement;
    let map: any;
    let L: any;
    let markers: any[] = [];

    $: if (map && items) {
        updateMarkers();
    }

    onMount(async () => {
        if (browser) {
            const leaflet = await import("leaflet");
            L = leaflet.default;

            try {
                // @ts-ignore
                await import("leaflet/dist/leaflet.css");
            } catch (e) {
                console.warn("Could not import leaflet css", e);
            }

            // Fix marker icons
            const DefaultIcon = L.icon({
                iconUrl:
                    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
                iconRetinaUrl:
                    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
                shadowUrl:
                    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41],
            });
            L.Marker.prototype.options.icon = DefaultIcon;

            // Center map: Priority User Loc -> Items Center -> Netherlands
            let initialLat = 52.1326;
            let initialLng = 5.2913;
            let zoom = 8;

            if (userLat && userLong) {
                initialLat = userLat;
                initialLng = userLong;
                zoom = 12;
            }

            map = L.map(mapElement).setView([initialLat, initialLng], zoom);

            L.tileLayer(
                "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
                {
                    attribution:
                        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                },
            ).addTo(map);

            // Add user location marker if available
            if (userLat && userLong) {
                const userIcon = L.divIcon({
                    className: "custom-user-pin",
                    html: `<div class="relative flex h-4 w-4">
                              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                              <span class="relative inline-flex rounded-full h-4 w-4 bg-sky-500 border-2 border-white shadow-sm"></span>
                           </div>`,
                    iconSize: [16, 16], // Size of the div
                    iconAnchor: [8, 8], // Center it
                });

                L.marker([userLat, userLong], { icon: userIcon })
                    .addTo(map)
                    .bindPopup("Your Location");
            }

            updateMarkers();
        }
    });

    onDestroy(() => {
        if (map) {
            map.remove();
        }
    });

    function updateMarkers() {
        // Clear existing markers
        markers.forEach((m) => map.removeLayer(m));
        markers = [];

        items.forEach((item) => {
            if (item.lat && item.long) {
                const popupContent =
                    type === "posts"
                        ? `<b>${item.title}</b><br/><a href="/post/${item.id}">View Post</a>`
                        : `<b>${item.name}</b><br/><a href="/user/${item.id}">View Profile</a><br/>${item.skills || ""}`;

                const marker = L.marker([
                    parseFloat(item.lat),
                    parseFloat(item.long),
                ])
                    .addTo(map)
                    .bindPopup(popupContent);

                markers.push(marker);
            }
        });

        // Adjust bounds if we have markers
        if (markers.length > 0) {
            const group = L.featureGroup(markers);
            map.fitBounds(group.getBounds().pad(0.1));
        }
    }
</script>

<div
    class="h-96 w-full rounded-md border border-gray-300 shadow-sm z-0"
    bind:this={mapElement}
></div>

<style>
    .leaflet-container {
        z-index: 0;
    }
</style>
