<script lang="ts">
    import type { PageData } from "./$types";
    import { viewMode } from "$lib/stores/viewMode";
    import { page as pageStore } from "$app/stores";
    import { goto } from "$app/navigation";
    import ResultsMap from "$lib/components/ResultsMap.svelte";

    export let data: PageData;

    // Skills filtering for guest view
    let selectedSkills: string[] = [];

    $: displayedMakers = data.topMakers
        ? selectedSkills.length > 0
            ? data.topMakers.filter((maker: any) => {
                  if (!maker.skills) return false;
                  const makerSkills = maker.skills
                      .split(",")
                      .map((s: string) => s.trim().toLowerCase());
                  return selectedSkills.some((skill) =>
                      makerSkills.includes(skill.toLowerCase()),
                  );
              })
            : data.topMakers
        : [];

    function toggleSkill(skill: string) {
        if (selectedSkills.includes(skill)) {
            selectedSkills = selectedSkills.filter((s) => s !== skill);
        } else {
            selectedSkills = [...selectedSkills, skill];
        }
    }

    // Reactive variables for Maker view filters (find projects section)
    let searchQuery = "";
    let locationStatus: "home" | "current" = "home";
    let userLat: number | null = data.user?.lat || null;
    let userLong: number | null = data.user?.long || null;
    let maxDistance = 50;
    let makerSkillsFilter: string[] = [];
    let displayMode: "list" | "map" = "map";

    // Pre-select user's skills for maker view
    $: if (
        data.user?.maker &&
        data.user?.skills &&
        makerSkillsFilter.length === 0
    ) {
        makerSkillsFilter = data.user.skills
            .split(",")
            .map((s: string) => s.trim());
    }

    async function getMakerLocation() {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLat = position.coords.latitude;
                userLong = position.coords.longitude;
                locationStatus = "current";
                updateMakerFilter();
            },
            () => {
                alert("Permission Denied");
            },
        );
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

    function toggleMakerSkill(skill: string) {
        if (makerSkillsFilter.includes(skill)) {
            makerSkillsFilter = makerSkillsFilter.filter((s) => s !== skill);
        } else {
            makerSkillsFilter = [...makerSkillsFilter, skill];
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
                        href="/register"
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
        <div class="mb-6">
            <h2
                class="text-lg font-semibold text-gray-900 dark:text-white mb-3"
            >
                Filter by skill
            </h2>
            <div class="flex flex-wrap gap-2">
                {#each data.skills || [] as skill}
                    <button
                        on:click={() => toggleSkill(skill)}
                        class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 {selectedSkills.includes(
                            skill,
                        )
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}"
                    >
                        {skill}
                    </button>
                {/each}
            </div>
        </div>

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
            <p class="text-gray-600 dark:text-gray-400 mb-6">
                <a
                    href="/login"
                    class="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                    >Log in here</a
                > to start fixing
            </p>
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
        <!-- Assigned Posts -->
        <div class="mb-12">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Assigned Posts
            </h2>
            {#if data.assignedPosts && data.assignedPosts.length > 0}
                <div
                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {#each data.assignedPosts as post}
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
                                        >In Progress</span
                                    >
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
                    No posts assigned to a maker yet.
                </p>
            {/if}
        </div>

        <!-- Unassigned Posts -->
        <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Unassigned Posts
            </h2>
            {#if data.unassignedPosts && data.unassignedPosts.length > 0}
                <div
                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {#each data.unassignedPosts as post}
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
                                        >Open</span
                                    >
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
                    All your posts have been assigned!
                </p>
            {/if}
        </div>
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
                        <label
                            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >Location</label
                        >
                        <button
                            on:click={getMakerLocation}
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm {locationStatus ===
                            'current'
                                ? 'bg-indigo-50 dark:bg-indigo-900 border-indigo-400'
                                : 'bg-white dark:bg-gray-700'} text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        >
                            {locationStatus === "current"
                                ? "📍 Current Location"
                                : "🏠 Home Location"}
                        </button>
                    </div>

                    <!-- Distance -->
                    <div>
                        <label
                            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >Max Distance (km)</label
                        >
                        <input
                            type="number"
                            bind:value={maxDistance}
                            on:change={updateMakerFilter}
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>

                    <!-- Search -->
                    <div>
                        <label
                            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >Search</label
                        >
                        <input
                            type="text"
                            bind:value={searchQuery}
                            on:input={() => setTimeout(updateMakerFilter, 500)}
                            placeholder="Search posts..."
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>

                    <!-- Display Toggle -->
                    <div>
                        <label
                            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >Display</label
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
                    <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >Skills</label
                    >
                    <div class="flex flex-wrap gap-2">
                        {#each data.skills || [] as skill}
                            <button
                                on:click={() => toggleMakerSkill(skill)}
                                class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 {makerSkillsFilter.includes(
                                    skill,
                                )
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}"
                            >
                                {skill}
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
                    <ResultsMap items={data.posts || []} type="posts" />
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
