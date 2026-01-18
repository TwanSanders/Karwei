<script lang="ts">
    import type { PageData } from "./$types";

    export let data: PageData;

    import { goto } from "$app/navigation";
    import { page } from "$app/stores";

    let userLat: number | null = null;
    let userLong: number | null = null;
    let maxDistance: number = 50; // Default 50km
    let locationStatus = "home"; // 'home' or 'current'

    // Initialize from URL if present
    $: {
        const lat = $page.url.searchParams.get("lat");
        const long = $page.url.searchParams.get("long");
        const dist = $page.url.searchParams.get("distance");

        if (lat && long) {
            userLat = parseFloat(lat);
            userLong = parseFloat(long);
            locationStatus = "current";
        } else {
            // If no params, we assume Home (server loaded logic), but visual state should match
            locationStatus = "home";
            userLat = null;
            userLong = null;
        }

        if (dist) maxDistance = parseFloat(dist);
    }

    async function getLocation() {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported");
            locationStatus = "home";
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLat = position.coords.latitude;
                userLong = position.coords.longitude;
                locationStatus = "current";
                updateFilter();
            },
            () => {
                alert("Permission Denied");
                locationStatus = "home";
            },
        );
    }

    function updateFilter() {
        const params = new URLSearchParams($page.url.searchParams);

        if (locationStatus === "current" && userLat && userLong) {
            params.set("lat", userLat.toString());
            params.set("long", userLong.toString());
        } else {
            // Home: Remove params, let server fallback to DB
            params.delete("lat");
            params.delete("long");
        }

        params.set("distance", maxDistance.toString());

        goto(`?${params.toString()}`, { keepFocus: true });
    }
    import ResultsMap from "$lib/components/ResultsMap.svelte";

    let searchType = data.searchType || "posts"; // 'posts' or 'makers'
    let viewMode = "list"; // 'list' or 'map'

    function updateSearchType(newType: string) {
        searchType = newType;
        const params = new URLSearchParams($page.url.searchParams);
        params.set("type", newType);
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
    <!-- Filters & Toggles -->
    <div class="bg-white rounded-lg shadow p-6 mb-8 flex flex-col space-y-4">
        <!-- Top Row: Location & Type & View Mode -->
        <div
            class="flex flex-col md:flex-row items-center justify-between gap-4"
        >
            <!-- Location Source -->
            <div class="flex items-center gap-4">
                <div class="relative inline-block text-left">
                    <label
                        for="locationSource"
                        class="block text-sm font-medium text-gray-700 mr-2"
                        >Location Source</label
                    >
                    <select
                        id="locationSource"
                        bind:value={locationStatus}
                        on:change={(e) => {
                            // @ts-ignore
                            const val = e.target.value;
                            if (val === "current") {
                                getLocation();
                            } else {
                                // Home
                                userLat = null;
                                userLong = null;
                                updateFilter();
                            }
                        }}
                        class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                        <option value="home">My Home Address</option>
                        <option value="current">Current Device Location</option>
                    </select>
                </div>

                {#if locationStatus === "current" && !userLat}
                    <span class="text-sm text-gray-500 animate-pulse"
                        >Locating...</span
                    >
                {:else if userLat}
                    <span
                        class="text-sm text-green-600 font-medium flex items-center"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-4 w-4 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fill-rule="evenodd"
                                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                clip-rule="evenodd"
                            />
                        </svg>
                        Active
                    </span>
                {/if}
            </div>

            <!-- Search Type: Items vs Makers -->
            <div class="flex items-center gap-2 bg-gray-100 p-1 rounded-md">
                <button
                    class={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${searchType === "posts" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                    on:click={() => updateSearchType("posts")}
                >
                    Items
                </button>
                <button
                    class={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${searchType === "makers" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                    on:click={() => updateSearchType("makers")}
                >
                    Makers
                </button>
            </div>

            <!-- View Mode: List vs Map -->
            <div class="flex items-center gap-2 bg-gray-100 p-1 rounded-md">
                <button
                    class={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === "list" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                    on:click={() => (viewMode = "list")}
                >
                    List
                </button>
                <button
                    class={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === "map" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                    on:click={() => (viewMode = "map")}
                >
                    Map
                </button>
            </div>
        </div>

        <!-- Distance Slider (Full Width) -->
        <div class="flex items-center gap-4 w-full">
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
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
        </div>
    </div>
</div>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <h2 class="text-3xl font-extrabold tracking-tight text-gray-900 mb-8">
        {searchType === "posts" ? "Recent Repair Requests" : "Available Makers"}
    </h2>

    {#if viewMode === "map"}
        <div class="mb-8 p-4 bg-white rounded-lg shadow">
            <ResultsMap
                items={searchType === "posts" ? data.posts : data.makers}
                type={searchType}
                {userLat}
                {userLong}
            />
        </div>
    {:else if (searchType === "posts" && data.posts.length === 0) || (searchType === "makers" && (!data.makers || data.makers.length === 0))}
        <div class="text-center py-12 bg-white rounded-lg shadow">
            <p class="text-gray-500">
                {searchType === "posts"
                    ? "No repair requests found. Be the first to post!"
                    : "No makers found nearby."}
            </p>
        </div>
    {:else if searchType === "posts"}
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
    {:else if searchType === "makers"}
        <div
            class="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 xl:gap-x-8"
        >
            {#each data.makers as maker}
                <div
                    class="group relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow p-6"
                >
                    <div class="flex items-center space-x-4">
                        {#if maker.image}
                            <img
                                class="h-12 w-12 rounded-full object-cover"
                                src={maker.image}
                                alt={maker.name}
                            />
                        {:else}
                            <span
                                class="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100"
                            >
                                <svg
                                    class="h-full w-full text-gray-300"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"
                                    />
                                </svg>
                            </span>
                        {/if}
                        <div>
                            <h3 class="text-lg font-medium text-gray-900">
                                <a href={`/user/${maker.id}`}>
                                    <span
                                        aria-hidden="true"
                                        class="absolute inset-0"
                                    ></span>
                                    {maker.name}
                                </a>
                            </h3>
                            <p class="text-sm text-gray-500">
                                {maker.skills || "Repairer"}
                            </p>
                        </div>
                    </div>
                    {#if maker.lat && userLat && userLong}
                        <div class="mt-2 text-xs text-gray-400">
                            {Math.round(
                                6371 *
                                    Math.acos(
                                        Math.cos((userLat * Math.PI) / 180) *
                                            Math.cos(
                                                (maker.lat * Math.PI) / 180,
                                            ) *
                                            Math.cos(
                                                (maker.long * Math.PI) / 180 -
                                                    (userLong * Math.PI) / 180,
                                            ) +
                                            Math.sin(
                                                (userLat * Math.PI) / 180,
                                            ) *
                                                Math.sin(
                                                    (maker.lat * Math.PI) / 180,
                                                ),
                                    ),
                            ).toFixed(1)} km away
                        </div>
                    {/if}
                </div>
            {/each}
        </div>
    {/if}
</div>
