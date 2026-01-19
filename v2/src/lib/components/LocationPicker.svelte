<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { browser } from "$app/environment";

    export let lat: number | null = null;
    export let long: number | null = null;

    let mapElement: HTMLElement;
    let map: any;
    let L: any;

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

            // Default to Netherlands center if no location provided
            const initialLat = lat || 52.1326;
            const initialLng = long || 5.2913;
            const zoomLevel = lat ? 15 : 7; // Zoom in closer if we have a location

            map = L.map(mapElement).setView(
                [initialLat, initialLng],
                zoomLevel,
            );

            L.tileLayer(
                "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
                {
                    attribution:
                        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                },
            ).addTo(map);

            // Initialize location if provided, otherwise wait for move
            if (!lat) {
                // If no initial lat/long, maybe we shouldn't set checks yet?
                // But user needs to pick something.
                // Let's update on move.
            }

            map.on("move", () => {
                // Optional: Do something while moving
            });

            map.on("moveend", () => {
                const center = map.getCenter();
                lat = center.lat;
                long = center.lng;
            });

            // Trigger initial update to set internal state if needed, or if map starts at default
            if (!lat) {
                const center = map.getCenter();
                lat = center.lat;
                long = center.lng;
            }
        }
    });

    onDestroy(() => {
        if (map) {
            map.remove();
        }
    });

    function locateMe() {
        if (!browser || !navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                map.setView([latitude, longitude], 15);
                lat = latitude;
                long = longitude;
            },
            () => {
                alert("Unable to retrieve your location");
            },
        );
    }
</script>

<div class="flex flex-col space-y-2 relative">
    <div
        class="relative h-64 w-full rounded-md border border-gray-300 shadow-sm z-0 overflow-hidden"
    >
        <div
            class="w-full h-full"
            bind:this={mapElement}
            style="z-index: 1;"
        ></div>

        <!-- Center Pin Overlay -->
        <div
            class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none"
            style="margin-top: -16px;"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 w-8 text-indigo-600 drop-shadow-md"
                viewBox="0 0 24 24"
                fill="currentColor"
            >
                <path
                    fill-rule="evenodd"
                    d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
                    clip-rule="evenodd"
                />
            </svg>
        </div>
    </div>

    <p class="text-xs text-gray-500 text-center">
        Move the map to position the pin at your home location.
    </p>

    <button
        type="button"
        on:click={locateMe}
        class="align-middle self-start inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
        <svg
            xmlns="http://www.w3.org/2000/svg"
            class="-ml-0.5 mr-2 h-4 w-4 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
        </svg>
        Locate Me
    </button>
    <input type="hidden" name="lat" value={lat ?? ""} />
    <input type="hidden" name="long" value={long ?? ""} />
</div>
