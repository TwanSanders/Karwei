<script lang="ts">
    import type { PageData } from "./$types";

    export let data: PageData;
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
