<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { browser } from "$app/environment";
    import type { PageData } from "./$types";

    // We can't import Leaflet directly in the script top-level during SSR
    // Types would need to be handled carefully or just use 'any' for the library import

    export let data: PageData;

    let mapElement: HTMLElement;
    let map: any;
    let userLat: number | null = null;
    let userLong: number | null = null;

    onMount(async () => {
        if (browser) {
            const L = (await import("leaflet")).default;
            // Fix for default marker icons missing in Webpack/Vite builds sometimes
            // @ts-ignore
            delete L.Icon.Default.prototype._getIconUrl;

            L.Icon.Default.mergeOptions({
                iconRetinaUrl:
                    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
                iconUrl:
                    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                shadowUrl:
                    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            });

            // Default center (Netherlands roughly) or calculate bounds
            const defaultCenter: [number, number] = [52.1326, 5.2913];
            const defaultZoom = 7;

            map = L.map(mapElement).setView(defaultCenter, defaultZoom);

            L.tileLayer(
                "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
                {
                    attribution:
                        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                },
            ).addTo(map);

            // Try to get user location
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        userLat = position.coords.latitude;
                        userLong = position.coords.longitude;

                        const userIcon = L.divIcon({
                            className: "custom-user-pin",
                            html: `<div class="relative flex h-4 w-4">
                              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                              <span class="relative inline-flex rounded-full h-4 w-4 bg-sky-500 border-2 border-white shadow-sm"></span>
                           </div>`,
                            iconSize: [16, 16],
                            iconAnchor: [8, 8],
                        });

                        L.marker([userLat, userLong], { icon: userIcon })
                            .addTo(map)
                            .bindPopup("Your Location");
                    },
                    (err) => {
                        console.warn(
                            "Location permission denied or error:",
                            err,
                        );
                    },
                );
            }

            const markers: any[] = [];

            if (data.posts && data.posts.length > 0) {
                data.posts.forEach((post) => {
                    if (post.lat && post.long) {
                        const marker = L.marker([post.lat, post.long]).addTo(
                            map,
                        );

                        let popupContent = `
                            <div class="p-2 w-48">
                                <h3 class="font-bold text-sm mb-1 line-clamp-2"><a href="/post/${post.id}" class="hover:underline text-indigo-600">${post.title}</a></h3>
                        `;

                        if (post.imageUrl) {
                            popupContent += `<img src="${post.imageUrl}" class="w-full h-24 object-cover rounded mb-2" alt="${post.title}"/>`;
                        }

                        if (post.targetPrice) {
                            popupContent += `<p class="text-green-600 font-semibold text-xs mb-1">Target: €${post.targetPrice.toFixed(2)}</p>`;
                        }

                        popupContent += `
                                <a href="/post/${post.id}" class="block mt-2 text-center text-xs bg-indigo-600 text-white py-1 px-2 rounded hover:bg-indigo-700 transition">View Details</a>
                            </div>
                        `;

                        marker.bindPopup(popupContent);
                        markers.push(marker);
                    }
                });
            }

            // Fit bounds if markers exist
            if (markers.length > 0) {
                const group = L.featureGroup(markers);
                map.fitBounds(group.getBounds().pad(0.1));
            }
        }
    });

    onDestroy(() => {
        if (map) {
            map.remove();
        }
    });
</script>

<svelte:head>
    <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossorigin=""
    />
</svelte:head>

<div class="flex flex-col h-full w-full">
    <div class="flex-none p-4 bg-white shadow-sm z-10">
        <h1 class="text-2xl font-bold text-gray-900">Explore Repairs</h1>
        <p class="text-sm text-gray-500">
            Find items that need fixing near you.
        </p>
    </div>
    <div
        class="flex-grow w-full h-[calc(100vh-8rem)] relative z-0"
        bind:this={mapElement}
    ></div>
</div>
