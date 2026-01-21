<script lang="ts">
    import { enhance } from "$app/forms";
    import type { PageData } from "./$types";
    import MakerBadge from "$lib/components/MakerBadge.svelte";
    import InfoTooltip from "$lib/components/InfoTooltip.svelte";

    export let data: PageData;
    $: user = data.publicUser;
    $: contactRequest = data.contactRequest;
    $: reviews = data.reviews;
    $: averageRating = data.averageRating;
    $: currentUserId = data.currentUserId;

    // Determine contact access
    $: isOwnProfile = currentUserId === user.id;
    $: canViewContact = isOwnProfile || contactRequest?.status === "accepted";
    $: requestPending = contactRequest?.status === "pending";
    $: requestDenied = contactRequest?.status === "denied";

    let isSubmitting = false;
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div
        class="bg-white dark:bg-slate-800 shadow overflow-hidden sm:rounded-lg"
    >
        <div class="px-4 py-5 sm:px-6 flex justify-between items-start">
            <div>
                <h3
                    class="text-lg leading-6 font-medium text-gray-900 dark:text-white flex items-center"
                >
                    {user.name}
                    {#if averageRating}
                        <span
                            class="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200"
                        >
                            ★ {averageRating.toFixed(1)}
                            {#if user.completedRepairs !== undefined}
                                ({user.completedRepairs})
                            {/if}
                        </span>
                    {/if}
                </h3>
                <div class="flex items-center gap-2">
                    <MakerBadge level={user.level} showRepairer={user.maker} />
                    {#if user.maker}
                        <InfoTooltip>
                            <p class="font-semibold mb-2">Maker Levels</p>
                            <ul class="text-xs space-y-1 mb-2">
                                <li
                                    class={user.level === "novice"
                                        ? "font-semibold text-green-300"
                                        : ""}
                                >
                                    🟢 Novice: 0-5 reviews
                                </li>
                                <li
                                    class={user.level === "handyman"
                                        ? "font-semibold text-blue-300"
                                        : ""}
                                >
                                    🔵 Handyman: 6-20 reviews
                                </li>
                                <li
                                    class={user.level === "master"
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
                                            >{6 - user.completedRepairs}</strong
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
                                        You've reached the highest level! 🎉
                                    {/if}
                                </p>
                            {/if}
                        </InfoTooltip>
                    {/if}
                </div>
                <div class="mt-1 flex items-center gap-2"></div>
                <p
                    class="mt-2 max-w-2xl text-sm text-gray-500 dark:text-gray-400"
                >
                    {user.bio || "No bio yet."}
                </p>
            </div>
            {#if user.image}
                <img
                    src={user.image}
                    alt={user.name}
                    class="h-24 w-24 rounded-full object-cover"
                />
            {/if}
        </div>
        <div
            class="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-0"
        >
            <dl class="sm:divide-y sm:divide-gray-200 dark:divide-gray-700">
                {#if user.skills}
                    <div
                        class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
                    >
                        <dt
                            class="text-sm font-medium text-gray-500 dark:text-gray-400"
                        >
                            Skills
                        </dt>
                        <dd
                            class="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2"
                        >
                            {#each user.skills.split(",") as skill}
                                <span
                                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mr-2 mb-1"
                                >
                                    {skill.trim()}
                                </span>
                            {/each}
                        </dd>
                    </div>
                {/if}

                <div
                    class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
                >
                    <dt
                        class="text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                        Contact Information
                    </dt>
                    <dd
                        class="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2"
                    >
                        {#if canViewContact}
                            <div class="flex items-start justify-between gap-4">
                                <div class="space-y-1 flex-1">
                                    <p>
                                        <span class="font-medium">Email:</span>
                                        {user.email}
                                    </p>
                                    <p>
                                        <span class="font-medium">Phone:</span>
                                        {user.phoneNumber || "Not provided"}
                                    </p>
                                </div>

                                {#if !isOwnProfile}
                                    <!-- Message Button -->
                                    <a
                                        href="/chat/{user.id}"
                                        class="inline-flex items-center gap-2 px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            class="h-4 w-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                            />
                                        </svg>
                                        Message {user.name.split(" ")[0]}
                                    </a>
                                {/if}
                            </div>
                        {:else}
                            <div class="flex items-center space-x-4">
                                <p
                                    class="text-gray-500 dark:text-gray-400 italic"
                                >
                                    Hidden to protect privacy.
                                </p>

                                <form
                                    action="?/requestContact"
                                    method="POST"
                                    use:enhance={() => {
                                        isSubmitting = true;
                                        return async ({ update }) => {
                                            await update();
                                            isSubmitting = false;
                                        };
                                    }}
                                >
                                    {#if requestPending}
                                        <button
                                            disabled
                                            class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 cursor-not-allowed"
                                        >
                                            Request Pending
                                        </button>
                                    {:else if requestDenied}
                                        <button
                                            disabled
                                            class="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-500 bg-red-50 cursor-not-allowed"
                                        >
                                            Request Denied
                                        </button>
                                    {:else}
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            class="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white {isSubmitting
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            {isSubmitting
                                                ? "Sending Request..."
                                                : "Request Contact Info"}
                                        </button>
                                    {/if}
                                </form>
                            </div>
                        {/if}
                    </dd>
                </div>
            </dl>
        </div>
    </div>

    {#if reviews && reviews.length > 0}
        <div
            class="mt-8 bg-white dark:bg-slate-800 shadow overflow-hidden sm:rounded-lg"
        >
            <div class="px-4 py-5 sm:px-6">
                <h3
                    class="text-lg leading-6 font-medium text-gray-900 dark:text-white"
                >
                    Reviews ({reviews.length})
                </h3>
            </div>
            <div class="border-t border-gray-200 dark:border-gray-700">
                <ul
                    role="list"
                    class="divide-y divide-gray-200 dark:divide-gray-700"
                >
                    {#each reviews as review}
                        <li class="px-4 py-4 sm:px-6">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                    {#if review.reviewerImage}
                                        <img
                                            src={review.reviewerImage}
                                            alt=""
                                            class="h-8 w-8 rounded-full mr-3 object-cover"
                                        />
                                    {:else}
                                        <div
                                            class="h-8 w-8 rounded-full bg-gray-100 mr-3 flex items-center justify-center"
                                        >
                                            <span class="text-xs text-gray-500"
                                                >?</span
                                            >
                                        </div>
                                    {/if}
                                    <div class="text-sm">
                                        <div
                                            class="font-medium text-gray-900 dark:text-white"
                                        >
                                            {review.reviewerName || "Anonymous"}
                                        </div>
                                        <div
                                            class="text-gray-500 dark:text-gray-400 text-xs"
                                        >
                                            {new Date(
                                                review.createdAt,
                                            ).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div class="flex items-center">
                                    {#each Array(5) as _, i}
                                        <svg
                                            class="h-4 w-4 {i <
                                            Math.round(Number(review.rating))
                                                ? 'text-yellow-400'
                                                : 'text-gray-300 dark:text-gray-600'}"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                                            />
                                        </svg>
                                    {/each}
                                </div>
                            </div>
                            {#if review.comment}
                                <p
                                    class="mt-2 text-sm text-gray-700 dark:text-gray-300"
                                >
                                    {review.comment}
                                </p>
                            {/if}
                        </li>
                    {/each}
                </ul>
            </div>
        </div>
    {/if}
</div>
