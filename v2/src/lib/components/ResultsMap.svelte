<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { browser } from "$app/environment";

    export let items: any[] = []; // Can be Posts or Makers
    export let type: "posts" | "makers" = "posts";
    export let userLat: number | null = null;
    export let userLong: number | null = null;
    export let locationType: "home" | "current" = "current";

    let mapElement: HTMLElement;
    let map: any;
    let L: any;
    let markers: any[] = [];
    let userMarker: any = null; // Keep reference to user location marker

    $: if (map && items) {
        updateMarkers();
    }

    // Watch for changes in user location or type and update marker
    $: if (map && L && (userLat || userLong)) {
        updateUserMarker();
    }

    // ... (onMount and other code)

    function updateUserMarker() {
        if (!map || !L || !userLat || !userLong) return;

        // Remove existing user marker
        if (userMarker) {
            map.removeLayer(userMarker);
        }

        let userIcon;
        if (locationType === "home") {
            userIcon = L.divIcon({
                className: "custom-home-pin",
                html: `<div class="relative flex items-center justify-center h-8 w-8 bg-indigo-600 rounded-full border-2 border-white shadow-md transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                       </div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 16], // Center anchor
            });
        } else {
            // Current Location (Pulse)
            userIcon = L.divIcon({
                className: "custom-user-pin",
                html: `<div class="relative flex h-4 w-4">
                          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                          <span class="relative inline-flex rounded-full h-4 w-4 bg-sky-500 border-2 border-white shadow-sm"></span>
                       </div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8],
            });
        }

        // Add new user marker
        userMarker = L.marker([userLat, userLong], { icon: userIcon })
            .addTo(map)
            .bindPopup(locationType === "home" ? "Home Base" : "Your Location");
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

    function updateMarkers() {
        // Clear existing markers
        markers.forEach((m) => map.removeLayer(m));
        markers = [];

        items.forEach((item) => {
            if (item.lat && item.long) {
                let popupContent = "";

                if (type === "posts") {
                    const imageUrl = item.imageUrl
                        ? `<img src="${item.imageUrl}" class="w-full h-32 object-cover" alt="${item.title}" />`
                        : `<div class="w-full h-32 bg-gray-100 flex items-center justify-center"><span class="text-gray-400 text-xs">No image</span></div>`;

                    const statusBadge =
                        item.status === "in_progress"
                            ? `<span class="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-[10px] font-medium">In Progress</span>`
                            : `<span class="px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-[10px] font-medium">Open</span>`;

                    popupContent = `
                        <div class="w-56 font-sans">
                            <div class="rounded-t-lg overflow-hidden">
                                ${imageUrl}
                            </div>
                            <div class="p-3">
                                <div class="flex justify-between items-start mb-1">
                                    <h3 class="font-bold text-sm text-gray-900 leading-tight truncate flex-1 mr-2" title="${item.title}">${item.title}</h3>
                                    ${statusBadge}
                                </div>
                                <p class="text-xs text-gray-500 line-clamp-2 mb-3 h-8 leading-4">${item.description || "No description"}</p>
                                <a href="/post/${item.id}" class="block w-full text-center px-3 py-2 bg-indigo-600 hover:bg-indigo-700 !text-white text-xs font-semibold rounded transition-colors !no-underline">
                                    View Details
                                </a>
                            </div>
                        </div>
                    `;
                } else {
                    // Maker Popup
                    const skills = (item.skills || [])
                        .map(
                            (s: any) =>
                                `<span class="inline-block px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded mr-1 mb-1">${typeof s === "string" ? s : s.name}</span>`,
                        )
                        .join("");

                    const level = item.level
                        ? item.level === "handyman"
                            ? "Handyman"
                            : item.level.charAt(0).toUpperCase() +
                              item.level.slice(1) +
                              " Repairer"
                        : "Repairer";

                    const ratingHtml = item.averageRating
                        ? `<span class="inline-flex items-center ml-2 px-1.5 py-0.5 rounded text-[10px] bg-yellow-50 text-yellow-700 border border-yellow-100 font-medium whitespace-nowrap">
                             <span class="mr-0.5 text-yellow-500">★</span>${Number(item.averageRating).toFixed(1)}
                           </span>`
                        : "";

                    popupContent = `
                        <div class="w-56 font-sans p-3">
                            <div class="flex items-center mb-2">
                                <div class="h-10 w-10 min-w-[2.5rem] rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold mr-3 text-lg border-2 border-white shadow-sm">
                                    ${item.name.charAt(0).toUpperCase()}
                                </div>
                                <div class="overflow-hidden">
                                    <h3 class="font-bold text-sm text-gray-900 truncate" title="${item.name}">${item.name}</h3>
                                    <div class="flex items-center flex-wrap">
                                        <p class="text-xs text-indigo-600 font-medium">${level}</p>
                                        ${ratingHtml}
                                    </div>
                                </div>
                            </div>
                            <div class="mb-3 flex flex-wrap max-h-16 overflow-hidden">
                                ${skills || '<span class="text-xs text-gray-400">No specific skills listed</span>'}
                            </div>
                            <a href="/user/${item.id}" class="block w-full text-center px-3 py-2 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 text-xs font-bold rounded transition-colors !no-underline uppercase tracking-wide">
                                View Profile
                            </a>
                        </div>
                    `;
                }

                const marker = L.marker([
                    parseFloat(item.lat),
                    parseFloat(item.long),
                ])
                    .addTo(map)
                    .bindPopup(popupContent, {
                        closeButton: false,
                        className: "custom-popup",
                        maxWidth: 300,
                        minWidth: 220,
                    });

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
        font-family: inherit;
    }

    /* Custom Popup Styles override */
    :global(.custom-popup .leaflet-popup-content-wrapper) {
        padding: 0;
        border-radius: 0.5rem;
        overflow: hidden;
        box-shadow:
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    :global(.custom-popup .leaflet-popup-content) {
        margin: 0 !important;
        width: auto !important;
    }

    :global(.custom-popup .leaflet-popup-tip) {
        background-color: white;
    }

    :global(.custom-home-pin) {
        z-index: 1000 !important;
    }
</style>
