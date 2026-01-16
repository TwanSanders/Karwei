<script lang="ts">
    import { enhance } from "$app/forms";
    import type { PageData } from "./$types";

    export let data: PageData;
    $: user = data.user;
    $: incomingRequests = data.incomingRequests.filter(
        (r) => r.status === "pending",
    );
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <div class="max-w-3xl mx-auto">
        <div class="bg-white shadow overflow-hidden sm:rounded-lg">
            <div class="px-4 py-5 sm:px-6">
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                    User Profile
                </h3>
                <p class="mt-1 max-w-2xl text-sm text-gray-500">
                    Personal details and preferences.
                </p>
            </div>
            <div class="border-t border-gray-200 px-4 py-5 sm:p-0">
                <dl class="sm:divide-y sm:divide-gray-200">
                    <div
                        class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
                    >
                        <dt class="text-sm font-medium text-gray-500">
                            Full name
                        </dt>
                        <dd
                            class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2"
                        >
                            {user.name}
                        </dd>
                    </div>
                    <div
                        class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
                    >
                        <dt class="text-sm font-medium text-gray-500">
                            Email address
                        </dt>
                        <dd
                            class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2"
                        >
                            {user.email}
                        </dd>
                    </div>
                    <div
                        class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
                    >
                        <dt class="text-sm font-medium text-gray-500">Roles</dt>
                        <dd
                            class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2"
                        >
                            <div class="flex flex-col space-y-2">
                                <span
                                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 w-fit"
                                >
                                    Customer
                                </span>
                                {#if user.maker}
                                    <span
                                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 w-fit"
                                    >
                                        Repairer
                                    </span>
                                {/if}
                            </div>
                        </dd>
                    </div>
                    <div
                        class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
                    >
                        <dt class="text-sm font-medium text-gray-500">
                            Settings
                        </dt>
                        <dd
                            class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2"
                        >
                            <form
                                action="?/toggleMaker"
                                method="POST"
                                use:enhance
                            >
                                <button
                                    type="submit"
                                    class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    {user.maker
                                        ? "Stop offering repair services"
                                        : "I want to offer repair services"}
                                </button>
                                <p class="mt-2 text-xs text-gray-500">
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

        {#if incomingRequests.length > 0}
            <div class="bg-white shadow overflow-hidden sm:rounded-lg mt-8">
                <div class="px-4 py-5 sm:px-6">
                    <h3 class="text-lg leading-6 font-medium text-gray-900">
                        Incoming Contact Requests
                    </h3>
                    <p class="mt-1 max-w-2xl text-sm text-gray-500">
                        Other users want to see your contact details.
                    </p>
                </div>
                <div class="border-t border-gray-200">
                    <ul role="list" class="divide-y divide-gray-200">
                        {#each incomingRequests as req}
                            <li class="px-4 py-4 sm:px-6">
                                <div class="flex items-center justify-between">
                                    <div
                                        class="text-sm font-medium text-indigo-600 truncate"
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
