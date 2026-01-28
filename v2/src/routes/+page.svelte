<script lang="ts">
    import type { PageData } from "./$types";
    import { viewMode } from "$lib/stores/viewMode";
    import { page as pageStore } from "$app/stores";
    import { goto } from "$app/navigation";
    import ResultsMap from "$lib/components/ResultsMap.svelte";

    export let data: PageData;

    $: displayedMakers = data.topMakers || [];

    // Combine posts for unified display
    $: myRepairRequests = [
        ...(data.assignedPosts || []),
        ...(data.unassignedPosts || []),
    ];

    // Show separated lists only if we have BOTH assigned and unassigned posts
    $: showSeparated =
        (data.assignedPosts?.length || 0) > 0 &&
        (data.unassignedPosts?.length || 0) > 0;

    // Reactive variables for Maker view filters (find projects section)
    let searchQuery = "";
    let locationStatus: "home" | "current" = "home";
    let userLat: number | null = data.user?.lat || null;
    let userLong: number | null = data.user?.long || null;
    let maxDistance = 50;
    let makerSkillsFilter: string[] = [];
    let displayMode: "list" | "map" = "map";
    let isLocating = false;

    // Pre-select user's skills for maker view
    $: if (
        data.user?.maker &&
        data.user?.skills &&
        makerSkillsFilter.length === 0
    ) {
        makerSkillsFilter = data.user.skills.map((s) => s.id);
    }

    async function setLocationMode(mode: "home" | "current") {
        if (mode === "current") {
            if (!navigator.geolocation) {
                alert("Geolocation is not supported");
                return;
            }

            isLocating = true;
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    isLocating = false;
                    userLat = position.coords.latitude;
                    userLong = position.coords.longitude;
                    locationStatus = "current";
                    updateMakerFilter();
                },
                () => {
                    isLocating = false;
                    alert("Permission Denied");
                    // Stay on home or revert if needed (though UI state is driven by locationStatus)
                    locationStatus = "home";
                },
            );
        } else {
            userLat = data.user?.lat || null;
            userLong = data.user?.long || null;
            locationStatus = "home";
            updateMakerFilter();
        }
    }

    function updateMakerFilter() {
        const params = new URLSearchParams();
        if (userLat && userLong) {
            params.set("lat", userLat.toString());
            params.set("long", userLong.toString());
        }
        params.set("distance", maxDistance.toString());
        if (makerSkillsFilter.length > 0) {
            params.set("skills", makerSkillsFilter.join(","));
        }
        if (searchQuery) {
            params.set("q", searchQuery);
        }
        goto(`?${params.toString()}`, { keepFocus: true, noScroll: true });
    }

    let debounceTimer: ReturnType<typeof setTimeout>;
    function debouncedUpdate() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            updateMakerFilter();
        }, 300);
    }

    function toggleMakerSkill(skillId: string) {
        if (makerSkillsFilter.includes(skillId)) {
            makerSkillsFilter = makerSkillsFilter.filter((s) => s !== skillId);
        } else {
            makerSkillsFilter = [...makerSkillsFilter, skillId];
        }
        updateMakerFilter();
    }
</script>

<!-- GUEST VIEW -->
{#if !data.user}
    <div
        class="bg-gradient-to-br from-indigo-600 to-purple-700 dark:from-indigo-800 dark:to-purple-900"
    >
        <div class="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
            <div class="text-center">
                <h1
                    class="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl"
                >
                    Europe gave you the right to repair. Use it.
                </h1>
                <p class="max-w-xl mt-5 mx-auto text-xl text-indigo-100">
                    Connect with skilled makers ready to fix your items
                </p>
                <div class="mt-8">
                    <a
                        href="/post/create"
                        class="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 shadow-xl transition-all duration-200 hover:scale-105"
                    >
                        I have something that needs fixing
                    </a>
                </div>
            </div>
        </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Skill Pills -->

        <!-- Map of Top Makers -->
        <div class="mb-12">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Top Makers in Belgium
            </h2>
            <div
                class="rounded-lg overflow-hidden shadow-lg"
                style="height: 500px;"
            >
                <ResultsMap items={displayedMakers} type="makers" />
            </div>
        </div>

        <!-- Latest Posts -->
        <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Are you the maker we're looking for?
            </h2>
            <div
                class="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border border-gray-100 dark:border-gray-700 p-6 rounded-xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-4"
            >
                <p class="text-lg text-gray-700 dark:text-gray-300">
                    Join our community of repair heroes and help others giving
                    objects a second life.
                </p>
                <a
                    href="/login"
                    class="whitespace-nowrap inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                >
                    Log in to start fixing
                    <svg
                        class="ml-2 -mr-1 w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                    </svg>
                </a>
            </div>
            <div
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
            >
                {#each data.latestPosts || [] as post}
                    <a
                        href="/post/{post.id}"
                        class="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-xl transition-shadow overflow-hidden"
                    >
                        {#if post.imageUrl}
                            <img
                                class="w-full h-48 object-cover"
                                src={post.imageUrl}
                                alt={post.title}
                            />
                        {:else}
                            <div
                                class="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
                            >
                                <span class="text-gray-400 dark:text-gray-500"
                                    >No image</span
                                >
                            </div>
                        {/if}
                        <div class="p-4">
                            <h3
                                class="font-semibold text-gray-900 dark:text-white truncate"
                            >
                                {post.title}
                            </h3>
                            <p
                                class="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2"
                            >
                                {post.description || "No description"}
                            </p>
                        </div>
                    </a>
                {/each}
            </div>
        </div>
    </div>

    <!-- POSTER VIEW -->
{:else if !data.user.maker || $viewMode === "poster"}
    <div
        class="bg-gradient-to-br from-indigo-600 to-purple-700 dark:from-indigo-800 dark:to-purple-900"
    >
        <div class="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8">
            <div class="text-center">
                <h1
                    class="text-3xl font-extrabold text-white sm:text-4xl sm:tracking-tight lg:text-5xl"
                >
                    Europe gave you the right to repair. Use it.
                </h1>
                <div class="mt-8">
                    <a
                        href="/post/create"
                        class="inline-flex items-center justify-center px-10 py-5 border border-transparent text-xl font-bold rounded-md text-indigo-600 bg-white hover:bg-indigo-50 shadow-2xl transition-all duration-200 hover:scale-105"
                    >
                        Post a broken item
                    </a>
                </div>
            </div>
        </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- My Repair Requests (Unified or Separated) -->
        {#if showSeparated}
            <!-- Assigned Posts -->
            <div class="mb-12">
                <h2
                    class="text-2xl font-bold text-gray-900 dark:text-white mb-4"
                >
                    Assigned Posts
                </h2>
                <div
                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {#each data.assignedPosts || [] as post}
                        <a
                            href="/post/{post.id}"
                            class="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-xl transition-shadow overflow-hidden"
                        >
                            {#if post.imageUrl}
                                <img
                                    class="w-full h-48 object-cover"
                                    src={post.imageUrl}
                                    alt={post.title}
                                />
                            {:else}
                                <div
                                    class="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
                                >
                                    <span
                                        class="text-gray-400 dark:text-gray-500"
                                        >No image</span
                                    >
                                </div>
                            {/if}
                            <div class="p-4">
                                <div
                                    class="flex items-center justify-between mb-2"
                                >
                                    <h3
                                        class="font-semibold text-gray-900 dark:text-white truncate"
                                    >
                                        {post.title}
                                    </h3>
                                    <span
                                        class="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                                    >
                                        In Progress
                                    </span>
                                </div>
                                <p
                                    class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2"
                                >
                                    {post.description || "No description"}
                                </p>
                            </div>
                        </a>
                    {/each}
                </div>
            </div>

            <!-- Unassigned Posts -->
            <div>
                <h2
                    class="text-2xl font-bold text-gray-900 dark:text-white mb-4"
                >
                    Unassigned Posts
                </h2>
                <div
                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {#each data.unassignedPosts || [] as post}
                        <a
                            href="/post/{post.id}"
                            class="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-xl transition-shadow overflow-hidden"
                        >
                            {#if post.imageUrl}
                                <img
                                    class="w-full h-48 object-cover"
                                    src={post.imageUrl}
                                    alt={post.title}
                                />
                            {:else}
                                <div
                                    class="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
                                >
                                    <span
                                        class="text-gray-400 dark:text-gray-500"
                                        >No image</span
                                    >
                                </div>
                            {/if}
                            <div class="p-4">
                                <div
                                    class="flex items-center justify-between mb-2"
                                >
                                    <h3
                                        class="font-semibold text-gray-900 dark:text-white truncate"
                                    >
                                        {post.title}
                                    </h3>
                                    <span
                                        class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                    >
                                        Open
                                    </span>
                                </div>
                                <p
                                    class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2"
                                >
                                    {post.description || "No description"}
                                </p>
                            </div>
                        </a>
                    {/each}
                </div>
            </div>
        {:else}
            <!-- Unified List (Fallback or Clean View) -->
            <div class="mb-12">
                <h2
                    class="text-2xl font-bold text-gray-900 dark:text-white mb-4"
                >
                    My Repair Requests
                </h2>
                {#if myRepairRequests.length > 0}
                    <div
                        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {#each myRepairRequests as post}
                            <a
                                href="/post/{post.id}"
                                class="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-xl transition-shadow overflow-hidden"
                            >
                                {#if post.imageUrl}
                                    <img
                                        class="w-full h-48 object-cover"
                                        src={post.imageUrl}
                                        alt={post.title}
                                    />
                                {:else}
                                    <div
                                        class="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
                                    >
                                        <span
                                            class="text-gray-400 dark:text-gray-500"
                                            >No image</span
                                        >
                                    </div>
                                {/if}
                                <div class="p-4">
                                    <div
                                        class="flex items-center justify-between mb-2"
                                    >
                                        <h3
                                            class="font-semibold text-gray-900 dark:text-white truncate"
                                        >
                                            {post.title}
                                        </h3>
                                        <span
                                            class="px-2 py-1 text-xs font-medium rounded-full {post.status ===
                                            'in_progress'
                                                ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                                                : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'}"
                                        >
                                            {post.status === "in_progress"
                                                ? "In Progress"
                                                : "Open"}
                                        </span>
                                    </div>
                                    <p
                                        class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2"
                                    >
                                        {post.description || "No description"}
                                    </p>
                                </div>
                            </a>
                        {/each}
                    </div>
                {:else}
                    <div
                        class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                    >
                        <h3
                            class="mt-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                            No active requests
                        </h3>
                        <p
                            class="mt-1 text-sm text-gray-500 dark:text-gray-400"
                        >
                            Get started by creating a new repair request.
                        </p>
                        <div class="mt-6">
                            <a
                                href="/post/create"
                                class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <svg
                                    class="-ml-1 mr-2 h-5 w-5"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        fill-rule="evenodd"
                                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                                        clip-rule="evenodd"
                                    />
                                </svg>
                                New Request
                            </a>
                        </div>
                    </div>
                {/if}
            </div>
        {/if}

        <!-- Become a Maker Promo -->
        {#if !data.user.maker}
            <div
                class="mt-12 pt-12 border-t border-gray-200 dark:border-gray-700"
            >
                <h2
                    class="text-2xl font-bold text-gray-900 dark:text-white mb-2"
                >
                    Are you the maker we're looking for?
                </h2>
                <div
                    class="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border border-gray-100 dark:border-gray-700 p-6 rounded-xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                    <p class="text-lg text-gray-700 dark:text-gray-300">
                        Join our community of repair heroes and help others
                        giving objects a second life.
                    </p>
                    <a
                        href="/profile"
                        class="whitespace-nowrap inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                    >
                        Upgrade Profile
                        <svg
                            class="ml-2 -mr-1 w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                        </svg>
                    </a>
                </div>
                <div
                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
                >
                    {#each data.latestPosts || [] as post}
                        <a
                            href="/post/{post.id}"
                            class="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-xl transition-shadow overflow-hidden"
                        >
                            {#if post.imageUrl}
                                <img
                                    class="w-full h-48 object-cover"
                                    src={post.imageUrl}
                                    alt={post.title}
                                />
                            {:else}
                                <div
                                    class="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
                                >
                                    <span
                                        class="text-gray-400 dark:text-gray-500"
                                        >No image</span
                                    >
                                </div>
                            {/if}
                            <div class="p-4">
                                <h3
                                    class="font-semibold text-gray-900 dark:text-white truncate"
                                >
                                    {post.title}
                                </h3>
                                <p
                                    class="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2"
                                >
                                    {post.description || "No description"}
                                </p>
                            </div>
                        </a>
                    {/each}
                </div>
            </div>
        {/if}
    </div>

    <!-- MAKER VIEW -->
{:else}
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- My Projects -->
        <div class="mb-12">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                My Projects
            </h2>
            {#if data.myProjects && data.myProjects.length > 0}
                <div
                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {#each data.myProjects as post}
                        <a
                            href="/post/{post.id}"
                            class="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-xl transition-shadow overflow-hidden"
                        >
                            {#if post.imageUrl}
                                <img
                                    class="w-full h-48 object-cover"
                                    src={post.imageUrl}
                                    alt={post.title}
                                />
                            {:else}
                                <div
                                    class="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
                                >
                                    <span
                                        class="text-gray-400 dark:text-gray-500"
                                        >No image</span
                                    >
                                </div>
                            {/if}
                            <div class="p-4">
                                <div
                                    class="flex items-center justify-between mb-2"
                                >
                                    <h3
                                        class="font-semibold text-gray-900 dark:text-white truncate"
                                    >
                                        {post.title}
                                    </h3>
                                    <span
                                        class="px-2 py-1 text-xs font-medium rounded-full {post.status ===
                                        'in_progress'
                                            ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                                            : post.status === 'fixed'
                                              ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}"
                                    >
                                        {post.status === "in_progress"
                                            ? "In Progress"
                                            : post.status === "fixed"
                                              ? "Fixed"
                                              : post.status}
                                    </span>
                                </div>
                                <p
                                    class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2"
                                >
                                    {post.description || "No description"}
                                </p>
                            </div>
                        </a>
                    {/each}
                </div>
            {:else}
                <p class="text-gray-600 dark:text-gray-400">
                    No projects assigned to you yet. Check "Find Projects"
                    below!
                </p>
            {/if}
        </div>

        <!-- Find Projects -->
        <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Find Projects
            </h2>

            <!-- Filters -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                <div
                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4"
                >
                    <!-- Location -->
                    <div>
                        <span
                            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >Location</span
                        >
                        <div
                            class="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 relative"
                        >
                            <button
                                on:click={() => setLocationMode("home")}
                                class="flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 z-10 {locationStatus ===
                                'home'
                                    ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-black/5'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}"
                            >
                                <span
                                    class="flex items-center justify-center gap-2"
                                >
                                    <span>🏠</span> Home
                                </span>
                            </button>
                            <button
                                on:click={() => setLocationMode("current")}
                                disabled={isLocating}
                                class="flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 z-10 flex items-center justify-center gap-2 {locationStatus ===
                                'current'
                                    ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-black/5'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'} {isLocating
                                    ? 'opacity-75 cursor-wait'
                                    : ''}"
                            >
                                {#if isLocating}
                                    <svg
                                        class="animate-spin h-4 w-4"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            class="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            stroke-width="4"
                                        ></circle>
                                        <path
                                            class="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    <span>Locating...</span>
                                {:else}
                                    <span>📍</span> Current
                                {/if}
                            </button>
                        </div>
                    </div>

                    <!-- Distance -->
                    <div>
                        <div class="flex justify-between mb-1">
                            <label
                                for="distance-filter"
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >Max Distance</label
                            >
                            <span
                                class="text-sm text-gray-500 dark:text-gray-400"
                                >{maxDistance} km</span
                            >
                        </div>
                        <input
                            id="distance-filter"
                            type="range"
                            min="5"
                            max="200"
                            step="5"
                            bind:value={maxDistance}
                            on:input={debouncedUpdate}
                            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        />
                    </div>

                    <!-- Search -->
                    <div>
                        <label
                            for="search-filter"
                            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >Search</label
                        >
                        <input
                            id="search-filter"
                            type="text"
                            bind:value={searchQuery}
                            on:input={() => setTimeout(updateMakerFilter, 500)}
                            placeholder="Search posts..."
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>

                    <!-- Display Toggle -->
                    <div>
                        <span
                            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >Display</span
                        >
                        <div
                            class="flex bg-gray-100 dark:bg-gray-700 rounded-md p-1"
                        >
                            <button
                                on:click={() => (displayMode = "list")}
                                class="flex-1 px-4 py-1.5 rounded text-sm font-medium transition-all {displayMode ===
                                'list'
                                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}"
                            >
                                List
                            </button>
                            <button
                                on:click={() => (displayMode = "map")}
                                class="flex-1 px-4 py-1.5 rounded text-sm font-medium transition-all {displayMode ===
                                'map'
                                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}"
                            >
                                Map
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Skills Pills -->
                <div>
                    <span
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >Skills</span
                    >
                    <div class="flex flex-wrap gap-2">
                        {#each data.skills || [] as skill}
                            <button
                                on:click={() => toggleMakerSkill(skill.id)}
                                class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 {makerSkillsFilter.includes(
                                    skill.id,
                                )
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}"
                            >
                                {#if skill.icon}
                                    <span>{skill.icon}</span>
                                {/if}
                                {skill.name}
                            </button>
                        {/each}
                    </div>
                </div>
            </div>

            <!-- Map/List Results -->
            {#if displayMode === "map"}
                <div
                    class="rounded-lg overflow-hidden shadow-lg"
                    style="height: 600px;"
                >
                    <ResultsMap
                        items={data.posts || []}
                        type="posts"
                        {userLat}
                        {userLong}
                        locationType={locationStatus}
                    />
                </div>
            {:else}
                <div
                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {#each data.posts || [] as post}
                        <a
                            href="/post/{post.id}"
                            class="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-xl transition-shadow overflow-hidden"
                        >
                            {#if post.imageUrl}
                                <img
                                    class="w-full h-48 object-cover"
                                    src={post.imageUrl}
                                    alt={post.title}
                                />
                            {:else}
                                <div
                                    class="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
                                >
                                    <span
                                        class="text-gray-400 dark:text-gray-500"
                                        >No image</span
                                    >
                                </div>
                            {/if}
                            <div class="p-4">
                                <div
                                    class="flex items-center justify-between mb-2"
                                >
                                    <h3
                                        class="font-semibold text-gray-900 dark:text-white truncate"
                                    >
                                        {post.title}
                                    </h3>
                                    {#if post.distance}
                                        <span
                                            class="text-xs text-gray-500 dark:text-gray-400"
                                            >{Math.round(post.distance)} km</span
                                        >
                                    {/if}
                                </div>
                                <p
                                    class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2"
                                >
                                    {post.description || "No description"}
                                </p>
                                {#if post.type}
                                    <span
                                        class="inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200"
                                    >
                                        {post.type}
                                    </span>
                                {/if}
                            </div>
                        </a>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
{/if}
