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
    <div class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                    {post.title}
                </h3>
                <p class="mt-1 max-w-2xl text-sm text-gray-500">
                    Posted by <a
                        href="/user/{post.userId}"
                        class="font-medium text-gray-900 hover:underline"
                        >{data.postUser?.name}</a
                    >
                    on {new Date(post.createdAt).toLocaleDateString()}
                </p>
            </div>
            <div>
                <span
                    class="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                >
                    {post.type || "General"}
                </span>
            </div>
        </div>
        <div class="border-t border-gray-200">
            <dl>
                <div
                    class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
                >
                    <dt class="text-sm font-medium text-gray-500">
                        Description
                    </dt>
                    <dd
                        class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2"
                    >
                        {post.description}
                    </dd>
                </div>
                {#if post.targetPrice}
                    <div
                        class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
                    >
                        <dt class="text-sm font-medium text-gray-500">
                            Target Budget
                        </dt>
                        <dd
                            class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2"
                        >
                            €{post.targetPrice.toFixed(2)}
                        </dd>
                    </div>
                {/if}
                {#if post.imageUrl}
                    <div
                        class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
                    >
                        <dt class="text-sm font-medium text-gray-500">Image</dt>
                        <dd
                            class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2"
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
            <h3 class="text-lg font-medium text-gray-900">Offers</h3>

            <div class="mt-4 space-y-4">
                {#if offers.length === 0}
                    <p class="text-gray-500 italic">No offers yet.</p>
                {:else}
                    {#each offers as offer}
                        <div
                            class="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
                        >
                            <div class="flex justify-between">
                                <div class="flex items-center">
                                    {#if offer.makerImage}
                                        <img
                                            src={offer.makerImage}
                                            alt=""
                                            class="h-8 w-8 rounded-full mr-2 object-cover"
                                        />
                                    {:else}
                                        <span
                                            class="inline-block h-8 w-8 rounded-full overflow-hidden bg-gray-100 mr-2"
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
                                    <h4 class="text-sm font-bold text-gray-900">
                                        <a
                                            href="/user/{offer.makerId}"
                                            class="hover:underline hover:text-indigo-600"
                                        >
                                            {offer.makerName || "A Repairer"}
                                        </a>
                                    </h4>
                                </div>
                                <span class="text-xs text-gray-500"
                                    >{new Date(
                                        offer.createdAt,
                                    ).toLocaleString()}</span
                                >
                            </div>
                            <p class="mt-2 text-sm text-gray-700">
                                {offer.message}
                            </p>
                            {#if offer.price}
                                <div
                                    class="mt-2 text-sm font-medium text-green-600"
                                >
                                    Offered Price: €{offer.price.toFixed(2)}
                                </div>
                            {/if}
                        </div>
                    {/each}
                {/if}
            </div>

            <!-- Offer Form for Repairers -->
            {#if isRepairer && !isOwner}
                <div
                    class="mt-8 bg-indigo-50 p-6 rounded-lg border border-indigo-100"
                >
                    <h4 class="text-base font-medium text-indigo-900">
                        Make an Offer
                    </h4>
                    <form
                        action="?/offer"
                        method="POST"
                        use:enhance
                        class="mt-4 space-y-4"
                    >
                        <div>
                            <label
                                for="message"
                                class="block text-sm font-medium text-gray-700"
                                >Message</label
                            >
                            <textarea
                                name="message"
                                id="message"
                                rows="3"
                                required
                                class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md bg-white"
                            ></textarea>
                        </div>
                        <div>
                            <label
                                for="price"
                                class="block text-sm font-medium text-gray-700"
                                >Price (€)</label
                            >
                            <input
                                type="number"
                                name="price"
                                id="price"
                                class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md bg-white w-32"
                            />
                        </div>
                        <button
                            type="submit"
                            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Submit Offer
                        </button>
                    </form>
                </div>
            {/if}
        </div>

        <div>
            <h3 class="text-lg font-medium text-gray-900">
                Comments ({comments.length})
            </h3>
            <div class="mt-4 space-y-4">
                {#if comments.length === 0}
                    <p class="text-gray-500 italic">No comments yet.</p>
                {:else}
                    {#each comments as comment}
                        <div
                            class="bg-gray-50 rounded-lg p-4 border border-gray-100"
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
                                    <h4 class="text-sm font-bold text-gray-900">
                                        {comment.userName || "User"}
                                    </h4>
                                </div>
                                <span class="text-xs text-gray-500"
                                    >{new Date(
                                        comment.createdAt,
                                    ).toLocaleDateString()}</span
                                >
                            </div>
                            <p
                                class="mt-2 text-sm text-gray-700 whitespace-pre-wrap"
                            >
                                {comment.message}
                            </p>
                        </div>
                    {/each}
                {/if}
            </div>

            <!-- Comment Form -->
            {#if data.currentUser}
                <div class="mt-6 bg-gray-50 p-4 rounded-lg">
                    <form
                        action="?/comment"
                        method="POST"
                        use:enhance
                        class="space-y-3"
                    >
                        <div>
                            <label
                                for="comment-message"
                                class="block text-sm font-medium text-gray-700"
                                >Add a comment</label
                            >
                            <textarea
                                name="message"
                                id="comment-message"
                                rows="2"
                                placeholder="Ask a question..."
                                class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md mt-1"
                                required
                            ></textarea>
                        </div>
                        <div class="flex justify-end">
                            <button
                                type="submit"
                                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
