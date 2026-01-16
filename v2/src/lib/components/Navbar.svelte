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
                        <span class="text-gray-700 text-sm font-medium mr-4"
                            >Hi, {$page.data.user.name}</span
                        >
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
