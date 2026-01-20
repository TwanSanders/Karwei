<script lang="ts">
    import { enhance } from "$app/forms";
    import { goto } from "$app/navigation";
    import { invalidateAll } from "$app/navigation";
    import type { PageData } from "./$types";
    import InfoTooltip from "$lib/components/InfoTooltip.svelte";
    import LocationPicker from "$lib/components/LocationPicker.svelte";
    import SkillSelector from "$lib/components/SkillSelector.svelte";
    import SkillBadges from "$lib/components/SkillBadges.svelte";
    import MakerBadge from "$lib/components/MakerBadge.svelte";

    export let data: PageData;
    $: ({ user, userPosts, userOffers, skills, averageRating, reviews } = data);
    $: incomingRequests = data.incomingRequests.filter(
        (r) => r.status === "pending",
    );

    // Change tracking - use data.user for initial values
    let bioChanged = false;
    let currentBio = data.user.bio || "";
    $: bioChanged = currentBio !== (data.user.bio || "");

    // Helper to round coordinates to 8 decimal places (about 1mm precision)
    const roundCoord = (val: number | null) =>
        val !== null ? Math.round(val * 100000000) / 100000000 : null;

    // Location tracking - convert decimals to numbers and round for comparison
    let locationChanged = false;
    let currentLocationLat: number | null = data.user.lat
        ? Number(data.user.lat)
        : null;
    let currentLocationLong: number | null = data.user.long
        ? Number(data.user.long)
        : null;
    $: {
        const originalLat = data.user.lat ? Number(data.user.lat) : null;
        const originalLong = data.user.long ? Number(data.user.long) : null;
        locationChanged =
            roundCoord(currentLocationLat) !== roundCoord(originalLat) ||
            roundCoord(currentLocationLong) !== roundCoord(originalLong);
    }

    let skillsChanged = false;
    let currentSkills = data.user.skills || "";
    $: skillsChanged = currentSkills !== (data.user.skills || "");

    let imageChanged = false;
    let currentImageFile: FileList | null = null;
    function handleImageChange(event: Event) {
        const input = event.target as HTMLInputElement;
        currentImageFile = input.files;
        imageChanged = currentImageFile !== null && currentImageFile.length > 0;
    }
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <div class="max-w-3xl mx-auto">
        <div
            class="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg"
        >
            <div class="px-4 py-5 sm:px-6">
                <h3
                    class="text-lg leading-6 font-medium text-gray-900 dark:text-white"
                >
                    User Profile
                </h3>
                <p
                    class="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400"
                >
                    Personal details and preferences.
                </p>
            </div>
            <div
                class="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-0"
            >
                <dl class="sm:divide-y sm:divide-gray-200 dark:divide-gray-700">
                    <div
                        class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
                    >
                        <dt
                            class="text-sm font-medium text-gray-500 dark:text-gray-400"
                        >
                            Full name
                        </dt>
                        <dd
                            class="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2"
                        >
                            {user.name}
                        </dd>
                    </div>
                    <div
                        class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
                    >
                        <dt
                            class="text-sm font-medium text-gray-500 dark:text-gray-400"
                        >
                            Profile Picture
                        </dt>
                        <dd
                            class="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2"
                        >
                            <div class="flex items-center space-x-4">
                                {#if user.image}
                                    <img
                                        src={user.image}
                                        alt=""
                                        class="h-12 w-12 rounded-full object-cover"
                                    />
                                {:else}
                                    <span
                                        class="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700"
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
                                <form
                                    action="?/updateImage"
                                    method="POST"
                                    enctype="multipart/form-data"
                                    use:enhance
                                >
                                    <div class="flex items-center space-x-2">
                                        <input
                                            name="image"
                                            accept="image/*"
                                            class="text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900/40 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/60"
                                        />
                                        <button
                                            type="submit"
                                            class="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
                                        >
                                            Update
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </dd>
                    </div>
                    <div
                        class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
                    >
                        <dt
                            class="text-sm font-medium text-gray-500 dark:text-gray-400"
                        >
                            Email address
                        </dt>
                        <dd
                            class="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2"
                        >
                            {user.email}
                        </dd>
                    </div>
                    <div
                        class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
                    >
                        <dt
                            class="text-sm font-medium text-gray-500 dark:text-gray-400"
                        >
                            Location
                            <InfoTooltip
                                text="Used to show you repairs/makers in your neighborhood. We calculate distance but never reveal your exact home address."
                            />
                        </dt>
                        <dd
                            class="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2"
                        >
                            <form
                                action="?/updateLocation"
                                method="POST"
                                use:enhance={() => {
                                    return async ({ result }) => {
                                        if (result.type === "success") {
                                            // Reload data from server to get database values as source of truth
                                            await invalidateAll();
                                            // Sync local state with the fresh data from server to ensure button resets
                                            currentLocationLat = data.user.lat
                                                ? Number(data.user.lat)
                                                : null;
                                            currentLocationLong = data.user.long
                                                ? Number(data.user.long)
                                                : null;
                                        }
                                    };
                                }}
                            >
                                <LocationPicker
                                    bind:lat={currentLocationLat}
                                    bind:long={currentLocationLong}
                                />
                                <div class="mt-2 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={!locationChanged}
                                        class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white transition-all {locationChanged
                                            ? 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                            : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed opacity-50'}"
                                    >
                                        Update Location
                                    </button>
                                </div>
                            </form>
                        </dd>
                    </div>
                    <div
                        class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
                    >
                        <dt
                            class="text-sm font-medium text-gray-500 dark:text-gray-400"
                        >
                            Biography
                        </dt>
                        <dd
                            class="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2"
                        >
                            <form
                                action="?/updateBio"
                                method="POST"
                                use:enhance={() => {
                                    return async ({ result, update }) => {
                                        if (result.type === "success") {
                                            // Update the user bio in data to reflect the change
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
                                    placeholder="Tell others about yourself and your repair experience..."
                                    class="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                ></textarea>
                                <div
                                    class="mt-2 flex items-center justify-between"
                                >
                                    <span
                                        class="text-xs text-gray-500 dark:text-gray-400"
                                    >
                                        {currentBio.length}/500 characters
                                    </span>
                                    <button
                                        type="submit"
                                        disabled={!bioChanged}
                                        class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white transition-all {bioChanged
                                            ? 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                            : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed opacity-50'}"
                                    >
                                        Update Biography
                                    </button>
                                </div>
                            </form>
                        </dd>
                    </div>
                    <div
                        class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
                    >
                        <dt
                            class="text-sm font-medium text-gray-500 dark:text-gray-400"
                        >
                            Roles
                        </dt>
                        <dd
                            class="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2"
                        >
                            <div class="flex flex-col space-y-2">
                                <span
                                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 w-fit"
                                >
                                    Customer
                                </span>
                                {#if user.maker}
                                    <span
                                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200 w-fit"
                                    >
                                        Repairer
                                    </span>
                                {/if}
                            </div>
                        </dd>
                    </div>
                    {#if user.maker}
                        <div
                            class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
                        >
                            <dt
                                class="text-sm font-medium text-gray-500 dark:text-gray-400"
                            >
                                Maker Stats
                            </dt>
                            <dd
                                class="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2"
                            >
                                <div class="flex flex-col space-y-3">
                                    <div class="flex items-center gap-2">
                                        <MakerBadge
                                            level={user.level}
                                            showRepairer={false}
                                        />
                                        <InfoTooltip>
                                            <p class="font-semibold mb-2">
                                                Maker Levels
                                            </p>
                                            <ul class="text-xs space-y-1 mb-2">
                                                <li
                                                    class={user.level ===
                                                    "novice"
                                                        ? "font-semibold text-green-300"
                                                        : ""}
                                                >
                                                    🟢 Novice: 0-5 reviews
                                                </li>
                                                <li
                                                    class={user.level ===
                                                    "handyman"
                                                        ? "font-semibold text-blue-300"
                                                        : ""}
                                                >
                                                    🔵 Handyman: 6-20 reviews
                                                </li>
                                                <li
                                                    class={user.level ===
                                                    "master"
                                                        ? "font-semibold text-purple-300"
                                                        : ""}
                                                >
                                                    🟣 Master: 21+ reviews
                                                </li>
                                            </ul>
                                            {#if user.completedRepairs !== undefined}
                                                <p
                                                    class="text-xs pt-2 border-t border-gray-600"
                                                >
                                                    {#if user.level === "novice"}
                                                        <strong
                                                            >{6 -
                                                                user.completedRepairs}</strong
                                                        >
                                                        more review{6 -
                                                            user.completedRepairs !==
                                                        1
                                                            ? "s"
                                                            : ""} to reach Handyman
                                                    {:else if user.level === "handyman"}
                                                        <strong
                                                            >{21 -
                                                                user.completedRepairs}</strong
                                                        >
                                                        more review{21 -
                                                            user.completedRepairs !==
                                                        1
                                                            ? "s"
                                                            : ""} to reach Master
                                                    {:else}
                                                        You've reached the
                                                        highest level! 🎉
                                                    {/if}
                                                </p>
                                            {/if}
                                        </InfoTooltip>
                                    </div>
                                    {#if averageRating}
                                        <div class="text-sm">
                                            <span
                                                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200"
                                            >
                                                ★ {averageRating.toFixed(1)}
                                                {#if user.completedRepairs !== undefined}
                                                    ({user.completedRepairs})
                                                {/if}
                                            </span>
                                        </div>
                                    {/if}
                                    {#if reviews && reviews.length > 0}
                                        <div
                                            class="text-xs text-gray-600 dark:text-gray-400"
                                        >
                                            <p class="font-medium mb-1">
                                                Recent Reviews:
                                            </p>
                                            <ul class="space-y-1">
                                                {#each reviews.slice(0, 3) as review}
                                                    <li>
                                                        ★ {review.rating} - {review.comment ||
                                                            "No comment"}
                                                    </li>
                                                {/each}
                                            </ul>
                                        </div>
                                    {:else}
                                        <div
                                            class="text-xs text-gray-500 dark:text-gray-400 italic"
                                        >
                                            No reviews yet. Complete repairs to
                                            earn your first review!
                                        </div>
                                    {/if}
                                </div>
                            </dd>
                        </div>
                    {/if}
                    <div
                        class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
                    >
                        <dt
                            class="text-sm font-medium text-gray-500 dark:text-gray-400"
                        >
                            Skills
                        </dt>
                        <dd
                            class="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2"
                        >
                            <SkillBadges skills={user.skills} />
                            <form
                                action="?/updateSkills"
                                method="POST"
                                use:enhance
                                class="mt-4"
                            >
                                <SkillSelector
                                    bind:selectedSkills={currentSkills}
                                    availableSkills={data.skills.map(
                                        (s) => s.name,
                                    )}
                                />
                                <div class="mt-2 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={!skillsChanged}
                                        class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white transition-all {skillsChanged
                                            ? 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                            : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed opacity-50'}"
                                    >
                                        Update Skills
                                    </button>
                                </div>
                            </form>
                        </dd>
                    </div>
                    <div
                        class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
                    >
                        <dt
                            class="text-sm font-medium text-gray-500 dark:text-gray-400"
                        >
                            Settings
                        </dt>
                        <dd
                            class="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2"
                        >
                            <form
                                action="?/toggleMaker"
                                method="POST"
                                use:enhance
                            >
                                <button
                                    type="submit"
                                    class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                        </dd>
                    </div>
                </dl>
            </div>
        </div>

        <div
            class="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mt-8"
        >
            <div class="px-4 py-5 sm:px-6">
                <h3
                    class="text-lg leading-6 font-medium text-gray-900 dark:text-white"
                >
                    My Posts
                </h3>
                <p
                    class="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400"
                >
                    Manage your repair requests.
                </p>
            </div>
            <div class="border-t border-gray-200">
                {#if userPosts.length === 0}
                    <div
                        class="px-4 py-5 sm:px-6 text-center text-gray-500 dark:text-gray-400 italic"
                    >
                        You haven't posted anything yet.
                    </div>
                {:else}
                    <ul
                        role="list"
                        class="divide-y divide-gray-200 dark:divide-gray-700"
                    >
                        {#each userPosts as post}
                            <li
                                class="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                                onclick={() => goto(`/post/${post.id}`)}
                            >
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center">
                                        <div class="flex-shrink-0 h-10 w-10">
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
                                        <div class="ml-4">
                                            <div
                                                class="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate max-w-xs sm:max-w-sm"
                                            >
                                                <a
                                                    href="/post/{post.id}"
                                                    class="hover:underline"
                                                >
                                                    {post.title}
                                                </a>
                                            </div>
                                            <div
                                                class="text-xs text-gray-500 dark:text-gray-400"
                                            >
                                                {new Date(
                                                    post.createdAt,
                                                ).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        class="flex items-center space-x-2 sm:space-x-4"
                                    >
                                        <div
                                            class="text-sm text-gray-500 dark:text-gray-400 hidden sm:block capitalize"
                                        >
                                            {post.status.replace("_", " ")}
                                        </div>

                                        {#if post.status === "open"}
                                            <form
                                                action="?/cancelPost"
                                                method="POST"
                                                use:enhance
                                            >
                                                <input
                                                    type="hidden"
                                                    name="postId"
                                                    value={post.id}
                                                />
                                                <button
                                                    type="submit"
                                                    class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                    onclick={(e) => {
                                                        e.stopPropagation();
                                                        if (
                                                            !confirm(
                                                                "Are you sure you want to cancel this post? It will be closed.",
                                                            )
                                                        )
                                                            e.preventDefault();
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            </form>
                                        {:else if post.status === "in_progress"}
                                            <form
                                                action="?/markFixed"
                                                method="POST"
                                                use:enhance
                                                class="inline-flex"
                                            >
                                                <input
                                                    type="hidden"
                                                    name="postId"
                                                    value={post.id}
                                                />
                                                <button
                                                    type="submit"
                                                    class="inline-flex items-center px-2 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200"
                                                    onclick={(e) => {
                                                        e.stopPropagation();
                                                        if (
                                                            !confirm(
                                                                "Mark as fixed?",
                                                            )
                                                        )
                                                            e.preventDefault();
                                                    }}
                                                >
                                                    Fixed
                                                </button>
                                            </form>
                                            <form
                                                action="?/unassignMaker"
                                                method="POST"
                                                use:enhance
                                                class="inline-flex"
                                            >
                                                <input
                                                    type="hidden"
                                                    name="postId"
                                                    value={post.id}
                                                />
                                                <button
                                                    type="submit"
                                                    class="inline-flex items-center px-2 py-1.5 border border-transparent text-xs font-medium rounded text-orange-700 bg-orange-100 hover:bg-orange-200"
                                                    onclick={(e) => {
                                                        e.stopPropagation();
                                                        if (
                                                            !confirm(
                                                                "Unassign maker? This will reopen the post.",
                                                            )
                                                        )
                                                            e.preventDefault();
                                                    }}
                                                >
                                                    Unassign
                                                </button>
                                            </form>
                                        {:else if post.status === "fixed"}
                                            <a
                                                href="/post/{post.id}#review"
                                                class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                                            >
                                                Review
                                            </a>
                                        {/if}
                                    </div>
                                </div>
                            </li>
                        {/each}
                    </ul>
                {/if}
            </div>
        </div>

        {#if user.maker && userOffers && userOffers.length > 0}
            <div
                class="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mt-8"
            >
                <div class="px-4 py-5 sm:px-6">
                    <h3
                        class="text-lg leading-6 font-medium text-gray-900 dark:text-white"
                    >
                        My Offers
                    </h3>
                    <p
                        class="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400"
                    >
                        Offers you have made on repair requests.
                    </p>
                </div>
                <div class="border-t border-gray-200 dark:border-gray-700">
                    <ul
                        role="list"
                        class="divide-y divide-gray-200 dark:divide-gray-700"
                    >
                        {#each userOffers as offer}
                            <li
                                class="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <div class="flex items-center justify-between">
                                    <div class="flex flex-col">
                                        <div
                                            class="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate max-w-xs sm:max-w-sm"
                                        >
                                            <a
                                                href="/post/{offer.postId}"
                                                class="hover:underline"
                                            >
                                                {offer.postTitle ||
                                                    "Unknown Post"}
                                            </a>
                                        </div>
                                        <div
                                            class="text-xs text-gray-500 dark:text-gray-400"
                                        >
                                            Offer: €{offer.price}
                                        </div>
                                        <div
                                            class="text-xs text-gray-400 dark:text-gray-500"
                                        >
                                            Status: {offer.postStatus}
                                        </div>
                                    </div>
                                    <div>
                                        {#if offer.postStatus === "open"}
                                            <form
                                                action="?/cancelOffer"
                                                method="POST"
                                                use:enhance
                                            >
                                                <input
                                                    type="hidden"
                                                    name="offerId"
                                                    value={offer.id}
                                                />
                                                <button
                                                    type="submit"
                                                    class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                    onclick={(e) => {
                                                        e.stopPropagation();
                                                        if (
                                                            !confirm(
                                                                "Withdraw this offer?",
                                                            )
                                                        )
                                                            e.preventDefault();
                                                    }}
                                                >
                                                    Withdraw
                                                </button>
                                            </form>
                                        {:else if offer.postStatus === "fixed"}
                                            <a
                                                href="/post/{offer.postId}#review"
                                                class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                                            >
                                                Review
                                            </a>
                                        {:else}
                                            <span
                                                class="text-xs text-gray-400 italic"
                                                >Cannot withdraw</span
                                            >
                                        {/if}
                                    </div>
                                </div>
                            </li>
                        {/each}
                    </ul>
                </div>
            </div>
        {/if}

        {#if incomingRequests.length > 0}
            <div
                class="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mt-8"
            >
                <div class="px-4 py-5 sm:px-6">
                    <h3
                        class="text-lg leading-6 font-medium text-gray-900 dark:text-white"
                    >
                        Incoming Contact Requests
                    </h3>
                    <p
                        class="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400"
                    >
                        Other users want to see your contact details.
                    </p>
                </div>
                <div class="border-t border-gray-200 dark:border-gray-700">
                    <ul
                        role="list"
                        class="divide-y divide-gray-200 dark:divide-gray-700"
                    >
                        {#each incomingRequests as req}
                            <li class="px-4 py-4 sm:px-6" id="request-{req.id}">
                                <div class="flex items-center justify-between">
                                    <div
                                        class="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate"
                                    >
                                        <a
                                            href={`/user/${req.requesterId}`}
                                            class="hover:underline"
                                        >
                                            {req.requesterName}
                                        </a>
                                    </div>
                                    <div
                                        class="ml-2 flex-shrink-0 flex space-x-2"
                                    >
                                        <form
                                            action="?/respondRequest"
                                            method="POST"
                                            use:enhance
                                        >
                                            <input
                                                type="hidden"
                                                name="requestId"
                                                value={req.id}
                                            />
                                            <input
                                                type="hidden"
                                                name="status"
                                                value="accepted"
                                            />
                                            <button
                                                type="submit"
                                                class="px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                            >
                                                Accept
                                            </button>
                                        </form>
                                        <form
                                            action="?/respondRequest"
                                            method="POST"
                                            use:enhance
                                        >
                                            <input
                                                type="hidden"
                                                name="requestId"
                                                value={req.id}
                                            />
                                            <input
                                                type="hidden"
                                                name="status"
                                                value="denied"
                                            />
                                            <button
                                                type="submit"
                                                class="px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                            >
                                                Deny
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </li>
                        {/each}
                    </ul>
                </div>
            </div>
        {/if}
    </div>
</div>
