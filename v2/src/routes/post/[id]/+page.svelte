<script lang="ts">
    import type { PageData } from "./$types";
    export let data: PageData;
    import { enhance } from "$app/forms";

    $: post = data.post;
    $: offers = data.offers;
    $: comments = data.comments;
    $: isOwner = data.currentUser?.id === post.userId;
    $: isRepairer = data.currentUser?.maker;
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
                <h3
                    class="text-lg leading-6 font-medium text-gray-900 dark:text-white"
                >
                    {post.title}
                </h3>
                <p
                    class="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400"
                >
                    Posted by <a
                        href="/user/{post.userId}"
                        class="font-medium text-gray-900 dark:text-gray-200 hover:underline"
                        >{data.postUser?.name}</a
                    >
                    on {new Date(post.createdAt).toLocaleDateString()}
                </p>
            </div>
            <div>
                <span
                    class="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium
                    {post.status === 'open'
                        ? 'bg-green-100 text-green-800'
                        : post.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : post.status === 'fixed'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-gray-100 text-gray-800'}"
                >
                    {post.status === "in_progress"
                        ? "In Progress"
                        : post.status
                          ? post.status.charAt(0).toUpperCase() +
                            post.status.slice(1)
                          : "Open"}
                </span>
                <span
                    class="ml-2 inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                >
                    {post.type || "General"}
                </span>
            </div>
        </div>
        <div class="border-t border-gray-200 dark:border-gray-700">
            <dl>
                <div
                    class="bg-gray-50 dark:bg-gray-700/50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
                >
                    <dt
                        class="text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                        Description
                    </dt>
                    <dd
                        class="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2"
                    >
                        {post.description}
                    </dd>
                </div>
                {#if post.targetPrice}
                    <div
                        class="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
                    >
                        <dt
                            class="text-sm font-medium text-gray-500 dark:text-gray-400"
                        >
                            Target Budget
                        </dt>
                        <dd
                            class="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2"
                        >
                            €{post.targetPrice.toFixed(2)}
                        </dd>
                    </div>
                {/if}
                {#if post.imageUrl}
                    <div
                        class="bg-gray-50 dark:bg-gray-700/50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
                    >
                        <dt
                            class="text-sm font-medium text-gray-500 dark:text-gray-400"
                        >
                            Image
                        </dt>
                        <dd
                            class="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2"
                        >
                            <img
                                src={post.imageUrl}
                                alt={post.title}
                                class="max-w-md rounded-lg shadow-sm"
                            />
                        </dd>
                    </div>
                {/if}
            </dl>
        </div>
    </div>

    <div class="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                Offers
            </h3>

            <div
                class="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8"
            >
                <h2
                    class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4"
                >
                    Offers
                </h2>

                {#if data.offers.length > 0}
                    <div class="space-y-4 mb-8">
                        {#each data.offers as offer}
                            <!-- Existing Offer UI -->
                            <div
                                class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm"
                            >
                                <div
                                    class="flex items-center justify-between mb-2"
                                >
                                    <a
                                        href="/user/{offer.makerId}"
                                        class="flex items-center space-x-3 group"
                                    >
                                        {#if offer.makerImage}
                                            <img
                                                class="h-8 w-8 rounded-full"
                                                src={offer.makerImage}
                                                alt={offer.makerName}
                                            />
                                        {:else}
                                            <span
                                                class="inline-block h-8 w-8 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-600"
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
                                        <span
                                            class="text-sm font-medium text-gray-900 dark:text-white group-hover:underline"
                                            >{offer.makerName ||
                                                "Unknown Maker"}</span
                                        >
                                    </a>
                                    <span
                                        class="text-xs text-gray-500 dark:text-gray-400"
                                    >
                                        {new Date(
                                            offer.createdAt,
                                        ).toLocaleString()}
                                    </span>
                                </div>
                                <p
                                    class="text-gray-700 dark:text-gray-300 mb-2"
                                >
                                    {offer.message}
                                </p>
                                {#if offer.price}
                                    <p
                                        class="text-green-600 dark:text-green-500 font-medium text-sm"
                                    >
                                        Offered Price: €{offer.price.toFixed(2)}
                                    </p>
                                {/if}

                                <!-- Accept Button (Owner Only) -->
                                {#if data.currentUser && data.post.userId === data.currentUser.id && data.post.status === "open"}
                                    <form
                                        action="?/acceptOffer"
                                        method="POST"
                                        use:enhance
                                        class="mt-3"
                                    >
                                        <input
                                            type="hidden"
                                            name="offerId"
                                            value={offer.id}
                                        />
                                        <input
                                            type="hidden"
                                            name="makerId"
                                            value={offer.makerId}
                                        />
                                        <button
                                            type="submit"
                                            class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                        >
                                            Accept Offer
                                        </button>
                                    </form>
                                {/if}
                            </div>
                        {/each}
                    </div>
                {:else}
                    <p class="text-gray-500 dark:text-gray-400 mb-8 italic">
                        No offers yet.
                    </p>
                {/if}

                <!-- Status Actions -->
                {#if data.post.status === "in_progress"}
                    <div
                        class="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8"
                    >
                        <h3
                            class="text-lg font-medium text-blue-900 dark:text-blue-100"
                        >
                            Repair in Progress
                        </h3>
                        <p
                            class="mt-2 text-sm text-blue-700 dark:text-blue-300"
                        >
                            The repair is currently underway. Once the job is
                            done, mark it as fixed.
                        </p>

                        <div class="mt-4 flex gap-4">
                            {#if data.currentUser && data.post.userId === data.currentUser.id}
                                <!-- Mark as Fixed -->
                                <form
                                    action="?/markFixed"
                                    method="POST"
                                    use:enhance
                                >
                                    <button
                                        type="submit"
                                        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                    >
                                        Mark as Fixed
                                    </button>
                                </form>

                                <!-- Unassign Fixer -->
                                <form
                                    action="?/unassign"
                                    method="POST"
                                    use:enhance
                                >
                                    <button
                                        type="submit"
                                        class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                        on:click={(e) => {
                                            if (
                                                !confirm(
                                                    "Are you sure you want to unassign this fixer? The post will be reopened.",
                                                )
                                            ) {
                                                e.preventDefault();
                                            }
                                        }}
                                    >
                                        Unassign Fixer
                                    </button>
                                </form>
                            {/if}
                        </div>
                    </div>
                {:else if data.post.status === "fixed"}
                    <!-- Fixed status UI -->
                    {#if data.currentUser && data.post.userId === data.currentUser.id}
                        <div
                            class="bg-green-50 dark:bg-green-900/40 p-6 rounded-lg border border-green-100 dark:border-green-800 mb-8"
                        >
                            <h4
                                class="text-base font-medium text-green-900 dark:text-green-100"
                            >
                                Repair Complete!
                            </h4>
                            <p
                                class="mt-1 text-sm text-green-700 dark:text-green-300 mb-4"
                            >
                                This item has been marked as fixed. Please leave
                                a review for the repairer.
                            </p>

                            <form
                                action="?/submitReview"
                                method="POST"
                                use:enhance
                                class="space-y-4"
                            >
                                <div>
                                    <label
                                        for="rating"
                                        class="block text-sm font-medium text-green-900"
                                        >Rating</label
                                    >
                                    <select
                                        id="rating"
                                        name="rating"
                                        class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                        <option value="5">5 - Excellent</option>
                                        <option value="4">4 - Very Good</option>
                                        <option value="3">3 - Good</option>
                                        <option value="2">2 - Fair</option>
                                        <option value="1">1 - Poor</option>
                                    </select>
                                </div>
                                <div>
                                    <label
                                        for="review-comment"
                                        class="block text-sm font-medium text-green-900"
                                        >Review</label
                                    >
                                    <textarea
                                        id="review-comment"
                                        name="comment"
                                        rows="3"
                                        class="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="How was the service?"
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    Submit Review
                                </button>
                            </form>
                        </div>
                    {/if}
                {:else if data.post.status === "closed"}
                    <div
                        class="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-8"
                    >
                        <div class="flex items-center">
                            <svg
                                class="h-5 w-5 text-gray-400 mr-2"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fill-rule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                            <span
                                class="text-gray-900 dark:text-white font-medium"
                                >This repair is closed. Thank you!</span
                            >
                        </div>
                    </div>
                {/if}

                <!-- Make Offer Form -->
                {#if data.currentUser && data.currentUser.maker && data.post.status === "open" && data.currentUser.id !== data.post.userId}
                    <div
                        class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                    >
                        <h3
                            class="text-lg font-medium text-gray-900 dark:text-white mb-4"
                        >
                            {data.myOffer
                                ? "Update Your Offer"
                                : "Make an Offer"}
                        </h3>
                        <form action="?/offer" method="POST" use:enhance>
                            <div class="mb-4">
                                <label
                                    for="message"
                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                    >Message</label
                                >
                                <textarea
                                    id="message"
                                    name="message"
                                    rows="3"
                                    class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                                    placeholder="Describe how you can help..."
                                    value={data.myOffer
                                        ? data.myOffer.message
                                        : ""}
                                ></textarea>
                            </div>
                            <div class="mb-4">
                                <label
                                    for="price"
                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                    >Price (€)</label
                                >
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    step="0.01"
                                    class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                                    placeholder="Optional amount"
                                    value={data.myOffer && data.myOffer.price
                                        ? data.myOffer.price
                                        : ""}
                                />
                            </div>
                            <div class="flex items-center gap-4">
                                <button
                                    type="submit"
                                    class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors w-full sm:w-auto"
                                >
                                    {data.myOffer
                                        ? "Update Offer"
                                        : "Submit Offer"}
                                </button>
                                <a
                                    href="/chat/{post.userId}?ref=post&id={post.id}"
                                    class="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium"
                                >
                                    Ask Question
                                </a>
                            </div>
                        </form>
                    </div>
                {/if}
            </div>
        </div>

        <div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                Comments ({comments.length})
            </h3>
            <div class="mt-4 space-y-4">
                {#if comments.length === 0}
                    <p class="text-gray-500 dark:text-gray-400 italic">
                        No comments yet.
                    </p>
                {:else}
                    {#each comments as comment}
                        <div
                            class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700"
                        >
                            <div class="flex justify-between items-start">
                                <div class="flex items-center">
                                    {#if comment.userImage}
                                        <img
                                            src={comment.userImage}
                                            alt=""
                                            class="h-6 w-6 rounded-full mr-2 object-cover"
                                        />
                                    {/if}
                                    <h4
                                        class="text-sm font-bold text-gray-900 dark:text-white"
                                    >
                                        {comment.userName || "User"}
                                    </h4>
                                </div>
                                <span
                                    class="text-xs text-gray-500 dark:text-gray-400"
                                    >{new Date(
                                        comment.createdAt,
                                    ).toLocaleDateString()}</span
                                >
                            </div>
                            <p
                                class="mt-2 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap"
                            >
                                {comment.message}
                            </p>
                        </div>
                    {/each}
                {/if}
            </div>

            <!-- Comment Form -->
            {#if data.currentUser}
                <div class="mt-6 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <form
                        action="?/comment"
                        method="POST"
                        use:enhance
                        class="space-y-3"
                    >
                        <div>
                            <label
                                for="comment-message"
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >Add a comment</label
                            >
                            <textarea
                                name="message"
                                id="comment-message"
                                rows="2"
                                placeholder="Ask a question..."
                                class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md mt-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                required
                            ></textarea>
                        </div>
                        <div class="flex justify-end">
                            <button
                                type="submit"
                                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 dark:text-indigo-200 bg-indigo-100 dark:bg-indigo-900/60 hover:bg-indigo-200 dark:hover:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Post Comment
                            </button>
                        </div>
                    </form>
                </div>
            {:else}
                <div class="mt-6 text-sm text-gray-500">
                    <a
                        href="/login"
                        class="text-indigo-600 hover:text-indigo-500">Log in</a
                    > to comment.
                </div>
            {/if}
        </div>
    </div>
</div>
