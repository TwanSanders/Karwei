<script lang="ts">
    import type { PageData } from "./$types";

    export let data: PageData;

    import { goto } from "$app/navigation";
    import { page } from "$app/stores";

    let userLat: number | null = null;
    let userLong: number | null = null;
    let maxDistance: number = 50; // Default 50km
    let locationStatus = "Use My Location";

    // Initialize from URL if present
    $: {
        const lat = $page.url.searchParams.get("lat");
        const long = $page.url.searchParams.get("long");
        const dist = $page.url.searchParams.get("distance");

        if (lat) userLat = parseFloat(lat);
        if (long) userLong = parseFloat(long);
        if (dist) maxDistance = parseFloat(dist);
    }

    async function getLocation() {
        locationStatus = "Locating...";
        if (!navigator.geolocation) {
            locationStatus = "Not Supported";
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLat = position.coords.latitude;
                userLong = position.coords.longitude;
                locationStatus = "Use My Location";
                updateFilter();
            },
            () => {
                locationStatus = "Permission Denied";
            },
        );
    }

    function updateFilter() {
        const params = new URLSearchParams($page.url.searchParams);
        if (userLat) params.set("lat", userLat.toString());
        if (userLong) params.set("long", userLong.toString());
        params.set("distance", maxDistance.toString());

        goto(`?${params.toString()}`, { keepFocus: true });
    }
</script>

<div class="bg-indigo-600">
    <div class="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div class="text-center">
            <h1
                class="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl"
            >
                Community Repair Platform
            </h1>
            <p class="mt-4 max-w-2xl mx-auto text-xl text-indigo-100">
                Connect with skilled repairers to fix your broken items. Reduce
                waste, save money, and build community.
            </p>
            <div class="mt-8">
                <a
                    href="/post/create"
                    class="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
                >
                    Post an Item to Repair
                </a>
            </div>
        </div>
    </div>
</div>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Location Filtering -->
    <div
        class="bg-white rounded-lg shadow p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4"
    >
        <div class="flex items-center gap-4">
            <button
                on:click={getLocation}
                class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-indigo-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 mr-2 -ml-1 text-gray-500"
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
                {locationStatus}
            </button>
            {#if userLat && userLong}
                <span class="text-sm text-green-600 font-medium"
                    >Location Active</span
                >
            {/if}
        </div>

        <div class="flex items-center gap-4 w-full md:w-auto">
            <label
                for="distance"
                class="block text-sm font-medium text-gray-700 whitespace-nowrap"
            >
                Max Distance: <span class="text-indigo-600 font-bold"
                    >{maxDistance} km</span
                >
            </label>
            <input
                id="distance"
                type="range"
                min="5"
                max="100"
                step="5"
                value={maxDistance}
                on:input={(e) => {
                    maxDistance = parseFloat(e.currentTarget.value);
                    updateFilter();
                }}
                disabled={!userLat}
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />
        </div>
    </div>
</div>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <h2 class="text-3xl font-extrabold tracking-tight text-gray-900 mb-8">
        Recent Repair Requests
    </h2>

    {#if data.posts.length === 0}
        <div class="text-center py-12 bg-white rounded-lg shadow">
            <p class="text-gray-500">
                No repair requests found. Be the first to post!
            </p>
        </div>
    {:else}
        <div
            class="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 xl:gap-x-8"
        >
            {#each data.posts as post}
                <div
                    class="group relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                    <div
                        class="w-full min-h-60 bg-gray-200 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75 h-60"
                    >
                        {#if post.imageUrl}
                            <img
                                src={post.imageUrl}
                                alt={post.title}
                                class="w-full h-full object-center object-cover"
                            />
                        {:else}
                            <div
                                class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400"
                            >
                                <svg
                                    class="h-12 w-12"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                        {/if}
                    </div>
                    <div class="mt-4 px-4 pb-4">
                        <div class="flex justify-between">
                            <div>
                                <h3 class="text-lg font-medium text-gray-900">
                                    <a href={`/post/${post.id}`}>
                                        <span
                                            aria-hidden="true"
                                            class="absolute inset-0"
                                        ></span>
                                        {post.title}
                                    </a>
                                </h3>
                                <p
                                    class="mt-1 text-sm text-gray-500 line-clamp-2"
                                >
                                    {post.description}
                                </p>
                            </div>
                            {#if post.targetPrice}
                                <p class="text-sm font-medium text-indigo-600">
                                    €{post.targetPrice.toFixed(2)}
                                </p>
                            {/if}
                        </div>
                        <div
                            class="mt-2 flex items-center text-xs text-gray-500"
                        >
                            <span>{post.type || "General"}</span>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>
