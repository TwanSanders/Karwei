<script lang="ts">
    import { enhance } from "$app/forms";
    import { goto } from "$app/navigation";
    import { invalidateAll } from "$app/navigation";
    import type { PageData } from "./$types";
    import { viewMode } from "$lib/stores/viewMode";
    import InfoTooltip from "$lib/components/InfoTooltip.svelte";
    import LocationPicker from "$lib/components/LocationPicker.svelte";
    import SkillSelector from "$lib/components/SkillSelector.svelte";
    import SkillBadges from "$lib/components/SkillBadges.svelte";
    import MakerBadge from "$lib/components/MakerBadge.svelte";

    export let data: PageData;
    $: ({ user, archivedPosts, completedProjects, skills, averageRating } =
        data);

    $: incomingRequests = data.incomingRequests.filter(
        (r) => r.status === "pending",
    );

    // Edit mode states
    let isPosterEditMode = false;
    let isMakerEditMode = false;
    let hasUnsavedChanges = false;

    // Helper to round coordinates to 8 decimal places (about 1mm precision)
    const roundCoord = (val: number | null) =>
        val !== null ? Math.round(val * 100000000) / 100000000 : null;

    // Poster profile state
    let currentBio = data.user.bio || "";
    let bioChanged = false;
    $: bioChanged = currentBio !== (data.user.bio || "");

    let posterLocationLat: number | null = data.user.lat
        ? Number(data.user.lat)
        : null;
    let posterLocationLong: number | null = data.user.long
        ? Number(data.user.long)
        : null;
    let posterLocationChanged = false;
    $: {
        const originalLat = data.user.lat ? Number(data.user.lat) : null;
        const originalLong = data.user.long ? Number(data.user.long) : null;
        posterLocationChanged =
            roundCoord(posterLocationLat) !== roundCoord(originalLat) ||
            roundCoord(posterLocationLong) !== roundCoord(originalLong);
    }

    // Maker profile state
    let currentMakerBio = data.user.makerBio || "";
    let makerBioChanged = false;
    $: makerBioChanged = currentMakerBio !== (data.user.makerBio || "");

    let makerLocationLat: number | null = data.user.lat
        ? Number(data.user.lat)
        : null;
    let makerLocationLong: number | null = data.user.long
        ? Number(data.user.long)
        : null;
    let makerLocationChanged = false;
    $: {
        const originalLat = data.user.lat ? Number(data.user.lat) : null;
        const originalLong = data.user.long ? Number(data.user.long) : null;
        makerLocationChanged =
            roundCoord(makerLocationLat) !== roundCoord(originalLat) ||
            roundCoord(makerLocationLong) !== roundCoord(originalLong);
    }

    let currentSkillIds: string[] = data.user.skills?.map((s) => s.id) || [];
    let skillsChanged = false;
    $: {
        const originalIds =
            data.user.skills
                ?.map((s) => s.id)
                .sort()
                .join(",") || "";
        const newIds = [...currentSkillIds].sort().join(",");
        skillsChanged = originalIds !== newIds;
    }

    // Check for unsaved changes
    $: hasUnsavedChanges =
        (isPosterEditMode && (bioChanged || posterLocationChanged)) ||
        (isMakerEditMode &&
            (makerBioChanged || makerLocationChanged || skillsChanged));

    // Profile picture handling
    let imageChanged = false;
    let currentImageFile: FileList | null = null;
    function handleImageChange(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];

        if (file) {
            if (!file.type.startsWith("image/")) {
                alert("Please select an image file.");
                input.value = "";
                currentImageFile = null;
                imageChanged = false;
                return;
            }

            const MAX_SIZE = 5 * 1024 * 1024; // 5MB
            if (file.size > MAX_SIZE) {
                alert("File size must be less than 5MB.");
                input.value = "";
                currentImageFile = null;
                imageChanged = false;
                return;
            }

            currentImageFile = input.files;
            imageChanged = true;
        } else {
            currentImageFile = null;
            imageChanged = false;
        }
    }

    // Toggle functions with unsaved changes check
    function toggleViewMode() {
        if (hasUnsavedChanges) {
            const confirmed = confirm(
                "You have unsaved changes. Do you want to discard them and switch profiles?",
            );
            if (!confirmed) return;

            // Reset edit modes and changes
            isPosterEditMode = false;
            isMakerEditMode = false;
            resetPosterChanges();
            resetMakerChanges();
        }
        $viewMode = $viewMode === "poster" ? "maker" : "poster";
    }

    function togglePosterEditMode() {
        if (!isPosterEditMode) {
            isPosterEditMode = true;
        }
    }

    function cancelPosterEdit() {
        isPosterEditMode = false;
        resetPosterChanges();
    }

    function resetPosterChanges() {
        currentBio = data.user.bio || "";
        posterLocationLat = data.user.lat ? Number(data.user.lat) : null;
        posterLocationLong = data.user.long ? Number(data.user.long) : null;
    }

    function toggleMakerEditMode() {
        if (!isMakerEditMode) {
            isMakerEditMode = true;
        }
    }

    function cancelMakerEdit() {
        isMakerEditMode = false;
        resetMakerChanges();
    }

    function resetMakerChanges() {
        currentMakerBio = data.user.makerBio || "";
        currentSkillIds = data.user.skills?.map((s) => s.id) || [];
        makerLocationLat = data.user.lat ? Number(data.user.lat) : null;
        makerLocationLong = data.user.long ? Number(data.user.long) : null;
    }
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <div class="max-w-4xl mx-auto">
        <!-- Profile Header (Always Visible) -->
        <div
            class="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-6"
        >
            <div class="px-4 py-5 sm:px-6 flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <!-- Profile Picture -->
                    <div>
                        {#if user.image}
                            <img
                                src={user.image}
                                alt=""
                                class="h-20 w-20 rounded-full object-cover ring-4 ring-indigo-100 dark:ring-indigo-900"
                            />
                        {:else}
                            <span
                                class="inline-block h-20 w-20 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 ring-4 ring-gray-200 dark:ring-gray-600"
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

                    <div>
                        <h1
                            class="text-2xl font-bold text-gray-900 dark:text-white"
                        >
                            {user.name}
                        </h1>
                        <p
                            class="text-sm text-gray-500 dark:text-gray-400 mt-1"
                        >
                            {user.email}
                        </p>

                        <!-- Update Profile Picture -->
                        <form
                            action="?/updateImage"
                            method="POST"
                            enctype="multipart/form-data"
                            use:enhance
                            class="mt-2"
                        >
                            <div class="flex items-center gap-2">
                                <input
                                    type="file"
                                    name="image"
                                    accept="image/*"
                                    class="text-xs text-gray-500 dark:text-gray-400 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900/40 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/60"
                                    onchange={handleImageChange}
                                />
                                <button
                                    type="submit"
                                    class="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium"
                                >
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Poster/Maker Toggle (if user is maker) -->
                {#if user.maker}
                    <button
                        onclick={toggleViewMode}
                        class="relative flex items-center bg-gray-700 dark:bg-gray-600 rounded-full p-1 w-40 h-10 cursor-pointer transition-colors"
                    >
                        <!-- Sliding indicator -->
                        <div
                            class="absolute h-8 w-20 bg-white dark:bg-gray-800 rounded-full shadow-md transition-transform duration-200 ease-in-out {$viewMode ===
                            'maker'
                                ? 'translate-x-[4.5rem]'
                                : 'translate-x-0'}"
                        ></div>

                        <!-- Labels -->
                        <span
                            class="relative z-10 flex-1 text-center text-sm font-medium transition-colors {$viewMode ===
                            'poster'
                                ? 'text-gray-900 dark:text-white'
                                : 'text-gray-300 dark:text-gray-400'}"
                        >
                            Poster
                        </span>
                        <span
                            class="relative z-10 flex-1 text-center text-sm font-medium transition-colors {$viewMode ===
                            'maker'
                                ? 'text-gray-900 dark:text-white'
                                : 'text-gray-300 dark:text-gray-400'}"
                        >
                            Maker
                        </span>
                    </button>
                {/if}
            </div>
        </div>

        <!-- POSTER PROFILE VIEW -->
        {#if !user.maker || $viewMode === "poster"}
            <!-- Edit Mode Toggle -->
            <div
                class="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-6"
            >
                <div
                    class="px-4 py-3 sm:px-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between"
                >
                    <h2
                        class="text-lg font-medium text-gray-900 dark:text-white"
                    >
                        Personal Information
                    </h2>
                    {#if !isPosterEditMode}
                        <button
                            onclick={togglePosterEditMode}
                            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Edit Profile
                        </button>
                    {/if}
                </div>

                <div class="px-4 py-5 sm:p-6 space-y-6">
                    <!-- Biography -->
                    <div>
                        <label
                            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Biography
                        </label>
                        {#if isPosterEditMode}
                            <form
                                action="?/updateBio"
                                method="POST"
                                use:enhance={() => {
                                    return async ({ result, update }) => {
                                        if (result.type === "success") {
                                            data.user.bio = currentBio;
                                        }
                                        await update({ reset: false });
                                    };
                                }}
                            >
                                <textarea
                                    name="bio"
                                    bind:value={currentBio}
                                    rows="4"
                                    maxlength="500"
                                    placeholder="Tell others about yourself..."
                                    class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                ></textarea>
                                <div
                                    class="mt-2 flex items-center justify-between"
                                >
                                    <span
                                        class="text-xs text-gray-500 dark:text-gray-400"
                                    >
                                        {currentBio.length}/500 characters
                                    </span>
                                </div>
                            </form>
                        {:else}
                            <p
                                class="mt-1 text-sm text-gray-600 dark:text-gray-300"
                            >
                                {user.bio || "No biography added yet."}
                            </p>
                        {/if}
                    </div>

                    <!-- Location -->
                    <div>
                        <label
                            class="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
                        >
                            Home Location
                            <InfoTooltip
                                text="Used to show you repairs in your neighborhood. We calculate distance but never reveal your exact home address."
                            />
                        </label>
                        {#if isPosterEditMode}
                            <form
                                action="?/updateLocation"
                                method="POST"
                                use:enhance={() => {
                                    return async ({ result }) => {
                                        if (result.type === "success") {
                                            await invalidateAll();
                                            posterLocationLat = data.user.lat
                                                ? Number(data.user.lat)
                                                : null;
                                            posterLocationLong = data.user.long
                                                ? Number(data.user.long)
                                                : null;
                                        }
                                    };
                                }}
                                class="mt-2"
                            >
                                <LocationPicker
                                    bind:lat={posterLocationLat}
                                    bind:long={posterLocationLong}
                                />
                            </form>
                        {:else}
                            <p
                                class="mt-1 text-sm text-gray-600 dark:text-gray-300"
                            >
                                {#if user.lat && user.long}
                                    Location set
                                {:else}
                                    No location set
                                {/if}
                            </p>
                        {/if}
                    </div>

                    <!-- Settings -->
                    <div
                        class="pt-4 border-t border-gray-200 dark:border-gray-700"
                    >
                        <label
                            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3"
                        >
                            Account Settings
                        </label>
                        <form action="?/toggleMaker" method="POST" use:enhance>
                            <button
                                type="submit"
                                class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                {user.maker
                                    ? "Stop offering repair services"
                                    : "I want to offer repair services"}
                            </button>
                            <p
                                class="mt-2 text-xs text-gray-500 dark:text-gray-400"
                            >
                                {user.maker
                                    ? "You will no longer be listed as a repairer, but you can still post items."
                                    : "Enabling this will allow you to make offers on posts."}
                            </p>
                        </form>
                    </div>

                    <!-- Save/Cancel Buttons -->
                    {#if isPosterEditMode}
                        <div
                            class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700"
                        >
                            <button
                                onclick={cancelPosterEdit}
                                class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                            >
                                Cancel
                            </button>

                            <!-- Save Bio Button -->
                            <form
                                action="?/updateBio"
                                method="POST"
                                use:enhance={() => {
                                    return async ({ result, update }) => {
                                        if (result.type === "success") {
                                            data.user.bio = currentBio;
                                            isPosterEditMode = false;
                                        }
                                        await update({ reset: false });
                                    };
                                }}
                                class="inline"
                            >
                                <button
                                    type="submit"
                                    disabled={!bioChanged &&
                                        !posterLocationChanged}
                                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-all {bioChanged ||
                                    posterLocationChanged
                                        ? 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                        : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed opacity-50'}"
                                >
                                    Save Changes
                                </button>
                            </form>
                        </div>
                    {/if}
                </div>
            </div>

            <!-- Archive Section -->
            {#if archivedPosts && archivedPosts.length > 0}
                <div
                    class="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg"
                >
                    <div class="px-4 py-5 sm:px-6">
                        <h3
                            class="text-lg leading-6 font-medium text-gray-900 dark:text-white"
                        >
                            Archive
                        </h3>
                        <p
                            class="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400"
                        >
                            Your completed repair requests.
                        </p>
                    </div>
                    <div class="border-t border-gray-200 dark:border-gray-700">
                        <ul
                            role="list"
                            class="divide-y divide-gray-200 dark:divide-gray-700"
                        >
                            {#each archivedPosts as post}
                                <li
                                    class="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                                    onclick={() => goto(`/post/${post.id}`)}
                                >
                                    <div
                                        class="flex items-center justify-between"
                                    >
                                        <div class="flex items-center flex-1">
                                            <div
                                                class="flex-shrink-0 h-10 w-10"
                                            >
                                                {#if post.imageUrl}
                                                    <img
                                                        class="h-10 w-10 rounded-full object-cover"
                                                        src={post.imageUrl}
                                                        alt=""
                                                    />
                                                {:else}
                                                    <div
                                                        class="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
                                                    >
                                                        <svg
                                                            class="h-6 w-6 text-gray-400 dark:text-gray-500"
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
                                            <div class="ml-4 flex-1">
                                                <div
                                                    class="flex items-center justify-between"
                                                >
                                                    <div>
                                                        <div
                                                            class="text-sm font-medium text-gray-900 dark:text-white"
                                                        >
                                                            {post.title}
                                                        </div>
                                                        <div
                                                            class="text-xs text-gray-500 dark:text-gray-400 mt-1"
                                                        >
                                                            {#if post.makerName}
                                                                Repaired by {post.makerName}
                                                            {:else}
                                                                Status: {post.status}
                                                            {/if}
                                                            • {new Date(
                                                                post.createdAt,
                                                            ).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                    <span
                                                        class="px-2 py-1 text-xs font-medium rounded-full {post.status ===
                                                        'fixed'
                                                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}"
                                                    >
                                                        {post.status === "fixed"
                                                            ? "Fixed"
                                                            : "Closed"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            {/each}
                        </ul>
                    </div>
                </div>
            {/if}

            <!-- MAKER PROFILE VIEW -->
        {:else if user.maker && $viewMode === "maker"}
            <!-- Maker Info Section -->
            <div class="bg-white dark:bg-gray-800 shadow sm:rounded-lg mb-6">
                <div
                    class="px-4 py-3 sm:px-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between"
                >
                    <h2
                        class="text-lg font-medium text-gray-900 dark:text-white"
                    >
                        Maker Information
                    </h2>
                    {#if !isMakerEditMode}
                        <button
                            onclick={toggleMakerEditMode}
                            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Edit Profile
                        </button>
                    {/if}
                </div>

                <div class="px-4 py-5 sm:p-6 space-y-6">
                    <!-- Maker Stats (Read-only) -->
                    <div
                        class="flex items-center gap-6 pb-6 border-b border-gray-200 dark:border-gray-700"
                    >
                        <div class="flex items-center">
                            <MakerBadge level={user.level} />
                            <InfoTooltip
                                text="Levels: Novice (0-5 repairs), Handyman (6-20 repairs), Master (21+ repairs)"
                            />
                        </div>
                        <div class="flex-1 grid grid-cols-2 gap-4">
                            <div>
                                <p
                                    class="text-sm text-gray-500 dark:text-gray-400"
                                >
                                    Completed Repairs
                                </p>
                                <p
                                    class="text-2xl font-bold text-gray-900 dark:text-white"
                                >
                                    {user.completedRepairs || 0}
                                </p>
                            </div>
                            <div>
                                <p
                                    class="text-sm text-gray-500 dark:text-gray-400"
                                >
                                    Average Rating
                                </p>
                                <p
                                    class="text-2xl font-bold text-gray-900 dark:text-white"
                                >
                                    {#if averageRating}
                                        ⭐ {averageRating.toFixed(1)}
                                    {:else}
                                        No ratings yet
                                    {/if}
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Maker Biography -->
                    <div>
                        <label
                            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Maker Biography
                        </label>
                        {#if isMakerEditMode}
                            <textarea
                                name="makerBio"
                                bind:value={currentMakerBio}
                                rows="4"
                                maxlength="500"
                                placeholder="Tell others about your repair skills and services..."
                                class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            ></textarea>
                            <div class="mt-2 flex items-center justify-between">
                                <span
                                    class="text-xs text-gray-500 dark:text-gray-400"
                                >
                                    {currentMakerBio.length}/500 characters
                                </span>
                            </div>
                        {:else}
                            <p
                                class="mt-1 text-sm text-gray-600 dark:text-gray-300"
                            >
                                {user.makerBio ||
                                    "No maker biography added yet."}
                            </p>
                        {/if}
                    </div>

                    <!-- Skills -->
                    <div>
                        <label
                            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                            Skills
                        </label>
                        {#if isMakerEditMode}
                            <SkillSelector
                                availableSkills={skills}
                                bind:selectedSkills={currentSkillIds}
                            />
                        {:else if user.skills && user.skills.length > 0}
                            <SkillBadges skills={user.skills} />
                        {:else}
                            <p
                                class="text-sm text-gray-500 dark:text-gray-400 italic"
                            >
                                No skills added yet.
                            </p>
                        {/if}
                    </div>

                    <!-- Location -->
                    <div>
                        <label
                            class="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
                        >
                            Location
                            <InfoTooltip
                                text="Your base location. This is used to match you with nearby repair requests."
                            />
                        </label>
                        {#if isMakerEditMode}
                            <div class="mt-2">
                                <LocationPicker
                                    bind:lat={makerLocationLat}
                                    bind:long={makerLocationLong}
                                />
                            </div>
                        {:else if user.lat && user.long}
                            <div class="mt-2">
                                <LocationPicker
                                    lat={user.lat}
                                    long={user.long}
                                    readonly={true}
                                />
                            </div>
                        {:else}
                            <p
                                class="mt-1 text-sm text-gray-600 dark:text-gray-300"
                            >
                                No location set
                            </p>
                        {/if}
                    </div>

                    <!-- Save/Cancel Buttons -->
                    {#if isMakerEditMode}
                        <div
                            class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700"
                        >
                            <button
                                onclick={cancelMakerEdit}
                                class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                            >
                                Cancel
                            </button>

                            <!-- Combined Save Button -->
                            <form
                                action="?/updateMakerBio"
                                method="POST"
                                use:enhance={({ formData }) => {
                                    // Add all maker fields to form data
                                    formData.set("makerBio", currentMakerBio);
                                    if (skillsChanged) {
                                        formData.set(
                                            "skillIds",
                                            currentSkillIds.join(","),
                                        );
                                    }
                                    if (makerLocationChanged) {
                                        formData.set(
                                            "lat",
                                            makerLocationLat?.toString() || "",
                                        );
                                        formData.set(
                                            "long",
                                            makerLocationLong?.toString() || "",
                                        );
                                    }

                                    return async ({ result, update }) => {
                                        if (result.type === "success") {
                                            // Update all fields
                                            data.user.makerBio =
                                                currentMakerBio;

                                            await invalidateAll();
                                            isMakerEditMode = false;
                                        }
                                        await update({ reset: false });
                                    };
                                }}
                                class="inline"
                            >
                                <button
                                    type="submit"
                                    disabled={!makerBioChanged &&
                                        !skillsChanged &&
                                        !makerLocationChanged}
                                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-all {makerBioChanged ||
                                    skillsChanged ||
                                    makerLocationChanged
                                        ? 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                        : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed opacity-50'}"
                                >
                                    Save Changes
                                </button>
                            </form>
                        </div>
                    {/if}
                </div>
            </div>

            <!-- Completed Projects Archive -->
            {#if completedProjects && completedProjects.length > 0}
                <div
                    class="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg"
                >
                    <div class="px-4 py-5 sm:px-6">
                        <h3
                            class="text-lg leading-6 font-medium text-gray-900 dark:text-white"
                        >
                            Completed Projects & Reviews
                        </h3>
                        <p
                            class="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400"
                        >
                            Your repair history and reviews.
                        </p>
                    </div>
                    <div class="border-t border-gray-200 dark:border-gray-700">
                        <ul
                            role="list"
                            class="divide-y divide-gray-200 dark:divide-gray-700"
                        >
                            {#each completedProjects as project}
                                <li
                                    class="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                                    onclick={() => goto(`/post/${project.id}`)}
                                >
                                    <div class="flex items-start gap-4">
                                        <div class="flex-shrink-0 h-16 w-16">
                                            {#if project.imageUrl}
                                                <img
                                                    class="h-16 w-16 rounded-lg object-cover"
                                                    src={project.imageUrl}
                                                    alt=""
                                                />
                                            {:else}
                                                <div
                                                    class="h-16 w-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
                                                >
                                                    <svg
                                                        class="h-8 w-8 text-gray-400 dark:text-gray-500"
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
                                        <div class="flex-1 min-w-0">
                                            <div
                                                class="flex items-start justify-between"
                                            >
                                                <div class="flex-1">
                                                    <p
                                                        class="text-sm font-medium text-gray-900 dark:text-white truncate"
                                                    >
                                                        {project.title}
                                                    </p>
                                                    <p
                                                        class="mt-1 text-xs text-gray-500 dark:text-gray-400"
                                                    >
                                                        For {project.posterName}
                                                        • {new Date(
                                                            project.createdAt,
                                                        ).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <span
                                                    class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                                >
                                                    {project.status === "fixed"
                                                        ? "Fixed"
                                                        : "Completed"}
                                                </span>
                                            </div>

                                            {#if project.review}
                                                <div
                                                    class="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                                                >
                                                    <div
                                                        class="flex items-center gap-2"
                                                    >
                                                        <span
                                                            class="text-sm font-medium text-gray-700 dark:text-gray-300"
                                                        >
                                                            Review:
                                                        </span>
                                                        <div
                                                            class="flex items-center"
                                                        >
                                                            <span
                                                                class="text-yellow-400"
                                                            >
                                                                {"⭐".repeat(
                                                                    Math.round(
                                                                        Number(
                                                                            project
                                                                                .review
                                                                                .rating,
                                                                        ),
                                                                    ),
                                                                )}
                                                            </span>
                                                            <span
                                                                class="ml-1 text-sm text-gray-600 dark:text-gray-400"
                                                            >
                                                                {Number(
                                                                    project
                                                                        .review
                                                                        .rating,
                                                                ).toFixed(1)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {#if project.review.comment}
                                                        <p
                                                            class="mt-2 text-sm text-gray-600 dark:text-gray-300"
                                                        >
                                                            "{project.review
                                                                .comment}"
                                                        </p>
                                                    {/if}
                                                </div>
                                            {:else}
                                                <p
                                                    class="mt-2 text-xs text-gray-500 dark:text-gray-400 italic"
                                                >
                                                    No review yet
                                                </p>
                                            {/if}
                                        </div>
                                    </div>
                                </li>
                            {/each}
                        </ul>
                    </div>
                </div>
            {/if}
        {/if}
    </div>
</div>
