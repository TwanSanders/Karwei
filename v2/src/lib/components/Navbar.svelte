<script lang="ts">
    import { page } from "$app/stores";
    import { enhance } from "$app/forms";
</script>

<nav class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
            <div class="flex">
                <div class="flex-shrink-0 flex items-center">
                    <a href="/" class="text-xl font-bold text-indigo-600"
                        >Karwei</a
                    >
                </div>
                <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
                    <a
                        href="/"
                        class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    >
                        Home
                    </a>
                </div>
            </div>
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <a
                        href="/post/create"
                        class="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <span>New Post</span>
                    </a>
                </div>
                <div class="ml-4 flex items-center">
                    {#if $page.data.user}
                        <div class="flex items-center mr-4">
                            {#if $page.data.user.image}
                                <img
                                    class="h-8 w-8 rounded-full object-cover mr-2"
                                    src={$page.data.user.image}
                                    alt={$page.data.user.name}
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
                            <span class="text-gray-700 text-sm font-medium"
                                >{$page.data.user.name}</span
                            >
                        </div>
                        <a
                            href="/profile"
                            class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium mr-2"
                            >Profile</a
                        >
                        <form
                            action="/profile?/logout"
                            method="POST"
                            use:enhance
                        >
                            <button
                                type="submit"
                                class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                                >Log out</button
                            >
                        </form>
                    {:else}
                        <a
                            href="/login"
                            class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                            >Log in</a
                        >
                        <a
                            href="/register"
                            class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                            >Register</a
                        >
                    {/if}
                </div>
            </div>
        </div>
    </div>
</nav>
