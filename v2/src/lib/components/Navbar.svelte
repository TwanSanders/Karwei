<script lang="ts">
    import { page } from "$app/stores";
    import { enhance } from "$app/forms";
    import { theme } from "$lib/stores/theme"; // <--- IMPORT STORE
    import { invalidateAll } from "$app/navigation";

    // Function to toggle
    function toggleTheme() {
        $theme = $theme === "dark" ? "light" : "dark";
    }

    let showNotifications = false;

    $: unreadCount = $page.data.unreadCount;

    async function toggleNotifications() {
        showNotifications = !showNotifications;

        if (showNotifications && unreadCount > 0) {
            // Optimistically clear the unread count
            const currentUnreadCount = unreadCount;
            unreadCount = 0;

            try {
                const response = await fetch("/api/notifications/read", {
                    method: "POST",
                });

                if (response.ok) {
                    // Refresh data to ensure server sync, but strictly speaking we just updated UI
                    invalidateAll();
                } else {
                    // Revert if failed (optional, but good UX)
                    unreadCount = currentUnreadCount;
                }
            } catch (e) {
                console.error("Failed to mark read", e);
                unreadCount = currentUnreadCount;
            }
        }
    }

    function handleClickOutside(event: MouseEvent) {
        if (!showNotifications) return;

        const target = event.target as HTMLElement;
        const dropdown = document.getElementById("notification-dropdown");
        const button = document.getElementById("user-menu-button");

        if (
            dropdown &&
            !dropdown.contains(target) &&
            button &&
            !button.contains(target)
        ) {
            showNotifications = false;
        }
    }
</script>

<svelte:window on:click={handleClickOutside} />

<nav class="bg-white dark:bg-gray-800 shadow transition-colors duration-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
            <div class="flex">
                <div class="flex-shrink-0 flex items-center">
                    <a
                        href="/"
                        class="text-xl font-bold text-indigo-600 dark:text-indigo-400"
                        >Karwei</a
                    >
                </div>
                <div class="hidden md:ml-6 md:flex md:space-x-8">
                    <a
                        href="/map"
                        class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border-b-2 border-transparent hover:border-indigo-500 dark:hover:border-indigo-400"
                    >
                        Map
                    </a>
                </div>
            </div>
            <div class="ml-4 flex items-center gap-4">
                <div class="flex-shrink-0">
                    <a
                        href="/post/create"
                        class="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <span>New Post</span>
                    </a>
                </div>
                <!-- Theme Toggle -->
                <button
                    on:click={toggleTheme}
                    class="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white focus:outline-none"
                    aria-label="Toggle Dark Mode"
                >
                    {#if $theme === "dark"}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                            />
                        </svg>
                    {:else}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                        </svg>
                    {/if}
                </button>

                {#if $page.data.user}
                    <!-- Notification Dropdown -->
                    <div class="relative ml-3">
                        <div>
                            <button
                                on:click={toggleNotifications}
                                type="button"
                                class="bg-white dark:bg-gray-700 p-1 rounded-full text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 relative"
                                id="user-menu-button"
                                aria-expanded="false"
                                aria-haspopup="true"
                            >
                                <span class="sr-only">View notifications</span>
                                <svg
                                    class="h-6 w-6"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                    />
                                </svg>
                                {#if unreadCount > 0}
                                    <span
                                        class="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500"
                                    ></span>
                                {/if}
                            </button>
                        </div>

                        {#if showNotifications}
                            <div
                                class="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50 max-h-96 overflow-y-auto"
                                role="menu"
                                id="notification-dropdown"
                                aria-orientation="vertical"
                                aria-labelledby="user-menu-button"
                                tabindex="-1"
                            >
                                <div
                                    class="px-4 py-2 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center"
                                >
                                    <h3
                                        class="text-sm font-semibold text-gray-900 dark:text-gray-100"
                                    >
                                        Notifications
                                    </h3>
                                </div>
                                {#if $page.data.notifications && $page.data.notifications.length > 0}
                                    {#each $page.data.notifications as notification}
                                        <a
                                            href={notification.type ===
                                            "contact_request"
                                                ? `/profile#request-${notification.relatedId}`
                                                : `/post/${notification.postId}`}
                                            class="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors"
                                            on:click={() => {
                                                showNotifications = false;
                                                $page.data.notifications =
                                                    $page.data.notifications.filter(
                                                        (n) =>
                                                            n.id !==
                                                            notification.id,
                                                    );
                                            }}
                                        >
                                            <p
                                                class="text-sm text-gray-800 dark:text-gray-200 font-medium"
                                            >
                                                {#if notification.type === "offer"}
                                                    New Offer Received
                                                {:else if notification.type === "accept"}
                                                    Offer Accepted
                                                {:else if notification.type === "contact_request"}
                                                    Contact Request Update
                                                {/if}
                                            </p>
                                            <p
                                                class="text-xs text-gray-500 mt-1"
                                            >
                                                Click to view
                                            </p>
                                        </a>
                                    {/each}
                                {:else}
                                    <div
                                        class="px-4 py-6 text-center text-gray-500 text-sm"
                                    >
                                        No notifications.
                                    </div>
                                {/if}
                            </div>
                        {/if}
                    </div>

                    <a
                        href="/profile"
                        class="flex items-center mr-4 hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition-colors"
                    >
                        {#if $page.data.user.image}
                            <img
                                class="h-8 w-8 rounded-full object-cover mr-2"
                                src={$page.data.user.image}
                                alt={$page.data.user.name}
                            />
                        {:else}
                            <span
                                class="inline-block h-8 w-8 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-600 mr-2"
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
                            class="text-gray-700 dark:text-gray-200 text-sm font-medium"
                            >{$page.data.user.name}</span
                        >
                    </a>
                    <form action="/profile?/logout" method="POST" use:enhance>
                        <button
                            type="submit"
                            class="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                            >Log out</button
                        >
                    </form>
                {:else}
                    <a
                        href="/login"
                        class="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                        >Log in</a
                    >
                    <a
                        href="/register"
                        class="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                        >Register</a
                    >
                {/if}
            </div>
        </div>
    </div>
</nav>
