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
    let userMarker: any = null; // Keep reference to user location marker

    $: if (map && items) {
        updateMarkers();
    }

    // Watch for changes in user location and update marker
    $: if (map && L && (userLat || userLong)) {
        updateUserMarker();
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

            // Try to get user's current location for the map
            if (!userLat && !userLong && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        userLat = position.coords.latitude;
                        userLong = position.coords.longitude;
                        // updateUserMarker will be called automatically via reactive statement
                    },
                    (err) => {
                        console.log("Geolocation not available or denied");
                    },
                );
            } else if (userLat && userLong) {
                updateUserMarker();
            }

            updateMarkers();
        }
    });

    onDestroy(() => {
        if (map) {
            map.remove();
        }
    });

    function updateUserMarker() {
        if (!map || !L || !userLat || !userLong) return;

        // Remove existing user marker
        if (userMarker) {
            map.removeLayer(userMarker);
        }

        // Create pulsing blue dot icon
        const userIcon = L.divIcon({
            className: "custom-user-pin",
            html: `<div class="relative flex h-4 w-4">
                      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                      <span class="relative inline-flex rounded-full h-4 w-4 bg-sky-500 border-2 border-white shadow-sm"></span>
                   </div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
        });

        // Add new user marker
        userMarker = L.marker([userLat, userLong], { icon: userIcon })
            .addTo(map)
            .bindPopup("Your Location");
    }

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

        // Adjust bounds if we have markers or user location
        const boundsLayers = [...markers];
        if (userMarker) {
            boundsLayers.push(userMarker);
        }

        if (boundsLayers.length > 0) {
            const group = L.featureGroup(boundsLayers);
            map.fitBounds(group.getBounds().pad(0.1));
        }
    }
</script>

<div
    class="h-full w-full rounded-md border border-gray-300 shadow-sm z-0"
    bind:this={mapElement}
></div>

<style>
    :global(.leaflet-container) {
        z-index: 0;
    }
</style>
