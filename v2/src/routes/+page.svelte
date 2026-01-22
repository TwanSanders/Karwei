<script lang="ts">
    import type { PageData } from "./$types";

    export let data: PageData;

    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import ResultsMap from "$lib/components/ResultsMap.svelte";
    import SkillBadges from "$lib/components/SkillBadges.svelte";
    import MakerBadge from "$lib/components/MakerBadge.svelte";

    let userLat: number | null = null;
    let userLong: number | null = null;
    let maxDistance: number = 50; // Default 50km
    let locationStatus = "home"; // 'home' or 'current'

    // Initialize from URL if present, otherwise use user's home location
    $: {
        const lat = $page.url.searchParams.get("lat");
        const long = $page.url.searchParams.get("long");
        const dist = $page.url.searchParams.get("distance");

        if (lat && long) {
            // URL params take priority (Current Device Location)
            userLat = parseFloat(lat);
            userLong = parseFloat(long);
            locationStatus = "current";
        } else if (data.user?.lat && data.user?.long) {
            // Use user's home location if no URL params
            userLat = data.user.lat;
            userLong = data.user.long;
            locationStatus = "home";
        } else {
            // No location available
            locationStatus = "home";
            userLat = null;
            userLong = null;
        }

        if (dist) maxDistance = parseFloat(dist);
    }

    let searchQuery = "";
    $: searchQuery = $page.url.searchParams.get("q") || "";

    // Skills filter - now loaded from database
    let selectedSkills: string[] = [];

    // Initialize selected skills from URL
    $: {
        const skillsParam = $page.url.searchParams.get("skills");
        if (skillsParam) {
            selectedSkills = skillsParam.split(",").filter(Boolean);
        } else {
            selectedSkills = [];
        }
    }

    function toggleSkillFilter(skill: string) {
        if (selectedSkills.includes(skill)) {
            selectedSkills = selectedSkills.filter((s) => s !== skill);
        } else {
            selectedSkills = [...selectedSkills, skill];
        }
        updateSkillsFilter();
    }

    function clearSkillsFilter() {
        selectedSkills = [];
        updateSkillsFilter();
    }

    function filterByMySkills() {
        if (data.user?.skills) {
            selectedSkills = data.user.skills
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
            updateSkillsFilter();
        }
    }

    function updateSkillsFilter() {
        const params = new URLSearchParams($page.url.searchParams);
        if (selectedSkills.length > 0) {
            params.set("skills", selectedSkills.join(","));
        } else {
            params.delete("skills");
        }
        goto(`?${params.toString()}`, { keepFocus: true, noScroll: true });
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
        } else if (locationStatus === "home") {
            // Home: Remove params, let server fallback to DB
            params.delete("lat");
            params.delete("long");
            // Set local coordinates from user data for map display
            if (data.user?.lat && data.user?.long) {
                userLat = data.user.lat;
                userLong = data.user.long;
            }
        }

        params.set("distance", maxDistance.toString());
        if (searchQuery) {
            params.set("q", searchQuery);
        } else {
            params.delete("q");
        }

        goto(`?${params.toString()}`, { keepFocus: true, noScroll: true });
    }

    let searchType: "posts" | "makers" =
        (data.searchType as "posts" | "makers") || "posts";
    let viewMode = "list"; // 'list' or 'map'

    function updateSearchType(newType: "posts" | "makers") {
        searchType = newType;
        const params = new URLSearchParams($page.url.searchParams);
        params.set("type", newType);
        goto(`?${params.toString()}`, { keepFocus: true });
    }
    const debouncedUpdateFilter = debounce(updateFilter, 300);

    function debounce(func: Function, wait: number) {
        let timeout: any;
        return function (...args: any[]) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this as any, args), wait);
        };
    }
</script>

<div class="bg-indigo-600">
    <div class="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div class="text-center">
            <h1
                class="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl"
            >
                Europe gave you the right to repair. Use it.
            </h1>
            <p class="mt-4 max-w-2xl mx-auto text-xl text-indigo-100">
                Connect with local makers to fix your broken items. Reduce
                waste, save money, and build community.
            </p>
            <div class="mt-8">
                <a
                    href="/post/create"
                    class="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 dark:bg-gray-800 dark:text-indigo-400 dark:hover:bg-gray-700 transition-colors"
                >
                    Post an Item to Repair
                </a>
            </div>
        </div>
    </div>
</div>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="lg:grid lg:grid-cols-12 lg:gap-8">
        <!-- Sidebar controls (Filters) -->
        <aside class="lg:col-span-3">
            <div class="lg:sticky lg:top-6 space-y-4">
                <div
                    class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 flex flex-col space-y-6 transition-colors duration-200"
                >
                    <h2
                        class="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-2 hidden lg:block"
                    >
                        Filters
                    </h2>

                    <!-- Search Input -->
                    <div>
                        <label
                            for="search"
                            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >Search</label
                        >
                        <div class="relative rounded-md shadow-sm">
                            <div
                                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                            >
                                <svg
                                    class="h-5 w-5 text-gray-400"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        fill-rule="evenodd"
                                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                        clip-rule="evenodd"
                                    />
                                </svg>
                            </div>
                            <input
                                type="text"
                                name="search"
                                id="search"
                                class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2"
                                placeholder="Search..."
                                bind:value={searchQuery}
                                on:input={() => debouncedUpdateFilter()}
                            />
                        </div>
                    </div>

                    <!-- Location Source -->
                    <div>
                        {#if data.user?.lat && data.user?.long}
                            <label
                                for="locationSource"
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
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
                                        updateFilter();
                                    }
                                }}
                                class="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="home">Home Address</option>
                                <option value="current">Device Location</option>
                            </select>
                        {:else}
                            <label
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                >Location</label
                            >
                            <button
                                on:click={getLocation}
                                class="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="h-5 w-5 mr-2"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fill-rule="evenodd"
                                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                        clip-rule="evenodd"
                                    />
                                </svg>
                                Find Me
                            </button>
                        {/if}
                    </div>

                    <!-- Search Type -->
                    <div>
                        <label
                            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >Show</label
                        >
                        <div class="flex rounded-md shadow-sm">
                            <button
                                class={`flex-1 px-3 py-2 text-sm font-medium rounded-l-md border border-gray-300 dark:border-gray-600 focus:z-10 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${searchType === "posts" ? "bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-indigo-500 z-10" : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"}`}
                                on:click={() => updateSearchType("posts")}
                            >
                                Items
                            </button>
                            <button
                                class={`flex-1 px-3 py-2 text-sm font-medium rounded-r-md border border-l-0 border-gray-300 dark:border-gray-600 focus:z-10 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${searchType === "makers" ? "bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-indigo-500 z-10" : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"}`}
                                on:click={() => updateSearchType("makers")}
                            >
                                Makers
                            </button>
                        </div>
                    </div>

                    <!-- View Mode -->
                    <div>
                        <label
                            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >View</label
                        >
                        <div class="flex rounded-md shadow-sm">
                            <button
                                class={`flex-1 px-3 py-2 text-sm font-medium rounded-l-md border border-gray-300 dark:border-gray-600 focus:z-10 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${viewMode === "list" ? "bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-indigo-500 z-10" : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"}`}
                                on:click={() => (viewMode = "list")}
                            >
                                List
                            </button>
                            <button
                                class={`flex-1 px-3 py-2 text-sm font-medium rounded-r-md border border-l-0 border-gray-300 dark:border-gray-600 focus:z-10 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${viewMode === "map" ? "bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-indigo-500 z-10" : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"}`}
                                on:click={() => (viewMode = "map")}
                            >
                                Map
                            </button>
                        </div>
                    </div>

                    <div
                        class="border-t border-gray-200 dark:border-gray-700 pt-4"
                    ></div>

                    <!-- Distance Slider -->
                    <div>
                        <div class="flex items-center justify-between mb-1">
                            <label
                                for="distance"
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Max Distance
                            </label>
                            <span
                                class="text-xs font-semibold text-indigo-600 dark:text-indigo-400"
                            >
                                {maxDistance} km
                            </span>
                        </div>
                        <input
                            id="distance"
                            type="range"
                            min="5"
                            max="100"
                            step="5"
                            value={maxDistance}
                            on:input={(e) => {
                                maxDistance = parseFloat(e.currentTarget.value);
                                debouncedUpdateFilter();
                            }}
                            class="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div
                        class="border-t border-gray-200 dark:border-gray-700 pt-4"
                    ></div>

                    <!-- Skills Filter -->
                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <label
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Skills
                            </label>
                            {#if selectedSkills.length > 0}
                                <button
                                    on:click={clearSkillsFilter}
                                    class="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                                >
                                    Clear
                                </button>
                            {/if}
                        </div>

                        {#if searchType === "posts" && data.user?.maker && data.user?.skills}
                            <button
                                on:click={filterByMySkills}
                                class="w-full text-xs px-2 py-2 rounded-md bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors font-medium border border-indigo-100 dark:border-indigo-800"
                            >
                                Apply My Skills
                            </button>
                        {/if}

                        <div class="flex flex-wrap gap-2">
                            {#each data.skills as skill}
                                <button
                                    on:click={() => toggleSkillFilter(skill)}
                                    class={`px-2 py-1 text-xs font-medium rounded-full transition-all border ${
                                        selectedSkills.includes(skill)
                                            ? "bg-indigo-600 dark:bg-indigo-500 text-white border-transparent shadow-sm"
                                            : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                                    }`}
                                >
                                    {skill}
                                </button>
                            {/each}
                        </div>
                    </div>
                </div>
            </div>
        </aside>

        <!-- Main Content (Results) -->
        <main class="mt-8 lg:mt-0 lg:col-span-9">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {searchType === "posts"
                    ? "Recent Repair Requests"
                    : "Available Makers"}
            </h2>

            {#if viewMode === "map"}
                <div
                    class="h-[600px] mb-8 bg-white dark:bg-gray-800 rounded-lg shadow transition-colors duration-200 overflow-hidden"
                >
                    <ResultsMap
                        items={searchType === "posts"
                            ? data.posts
                            : data.makers}
                        type={searchType}
                        {userLat}
                        {userLong}
                    />
                </div>
            {:else if (searchType === "posts" && data.posts.length === 0) || (searchType === "makers" && (!data.makers || data.makers.length === 0))}
                <div
                    class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow transition-colors duration-200"
                >
                    <div class="flex flex-col items-center justify-center">
                        <svg
                            class="h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <p
                            class="mt-2 text-gray-500 dark:text-gray-400 text-lg"
                        >
                            {searchType === "posts"
                                ? "No repair requests found matching your criteria."
                                : "No makers found nearby."}
                        </p>
                        {#if selectedSkills.length > 0 || maxDistance < 50}
                            <button
                                on:click={() => {
                                    clearSkillsFilter();
                                    maxDistance = 50;
                                    debouncedUpdateFilter();
                                }}
                                class="mt-4 text-indigo-600 hover:text-indigo-500 font-medium"
                            >
                                Clear filters
                            </button>
                        {/if}
                    </div>
                </div>
            {:else if searchType === "posts"}
                <div
                    class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                    {#each data.posts as post}
                        <div
                            class="group relative flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow h-full"
                        >
                            <div
                                class="w-full h-48 bg-gray-200 dark:bg-gray-700 relative"
                            >
                                {#if post.imageUrl}
                                    <img
                                        src={post.imageUrl}
                                        alt={post.title}
                                        loading="lazy"
                                        class="w-full h-full object-center object-cover"
                                    />
                                {:else}
                                    <div
                                        class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
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
                                {#if post.distance !== undefined && post.distance !== null}
                                    <div
                                        class="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm"
                                    >
                                        {post.distance.toFixed(1)} km
                                    </div>
                                {/if}
                            </div>
                            <div
                                class="p-4 flex-1 flex flex-col justify-between"
                            >
                                <div>
                                    <div
                                        class="flex justify-between items-start"
                                    >
                                        <h3
                                            class="text-lg font-medium text-gray-900 dark:text-white line-clamp-1"
                                        >
                                            <a href={`/post/${post.id}`}>
                                                <span
                                                    aria-hidden="true"
                                                    class="absolute inset-0"
                                                ></span>
                                                {post.title}
                                            </a>
                                        </h3>
                                        {#if post.targetPrice}
                                            <span
                                                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
                                            >
                                                €{post.targetPrice.toFixed(0)}
                                            </span>
                                        {/if}
                                    </div>
                                    <p
                                        class="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2"
                                    >
                                        {post.description}
                                    </p>
                                </div>
                                <div
                                    class="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-700"
                                >
                                    <span
                                        class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                                    >
                                        {post.type || "General"}
                                    </span>
                                    <span
                                        >{new Date(
                                            post.createdAt,
                                        ).toLocaleDateString()}</span
                                    >
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            {:else if searchType === "makers"}
                <div
                    class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                    {#each data.makers as maker}
                        <div
                            class="group relative bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow p-6"
                        >
                            <div class="flex items-start space-x-4">
                                <div class="flex-shrink-0">
                                    {#if maker.image}
                                        <img
                                            class="h-12 w-12 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm"
                                            src={maker.image}
                                            alt={maker.name}
                                            loading="lazy"
                                        />
                                    {:else}
                                        <span
                                            class="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-600"
                                        >
                                            <svg
                                                class="h-full w-full text-gray-300 dark:text-gray-500"
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"
                                                />
                                            </svg>
                                        </span>
                                    {/if}
                                </div>
                                <div class="flex-1 min-w-0">
                                    <h3
                                        class="text-lg font-medium text-gray-900 dark:text-white truncate"
                                    >
                                        <a href={`/user/${maker.id}`}>
                                            <span
                                                aria-hidden="true"
                                                class="absolute inset-0"
                                            ></span>
                                            {maker.name}
                                        </a>
                                    </h3>
                                    <MakerBadge
                                        level={maker.level}
                                        showRepairer={true}
                                    />
                                    {#if maker.averageRating}
                                        <span
                                            class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200 mt-1"
                                        >
                                            ★ {maker.averageRating.toFixed(1)}
                                            {#if maker.completedRepairs !== undefined}
                                                ({maker.completedRepairs})
                                            {/if}
                                        </span>
                                    {/if}
                                    {#if maker.distance}
                                        <p
                                            class="text-sm text-gray-500 dark:text-gray-400"
                                        >
                                            {maker.distance.toFixed(1)} km away
                                        </p>
                                    {/if}
                                </div>
                            </div>
                            <div class="mt-4">
                                <SkillBadges
                                    skills={maker.skills}
                                    size="small"
                                />
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </main>
    </div>
</div>
