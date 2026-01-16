<script lang="ts">
    import { enhance } from "$app/forms";
    import type { PageData } from "./$types";

    export let data: PageData;
    $: user = data.publicUser;
    $: contactRequest = data.contactRequest;

    // Determine contact access
    $: canViewContact = contactRequest?.status === "accepted";
    $: requestPending = contactRequest?.status === "pending";
    $: requestDenied = contactRequest?.status === "denied";
</script>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6 flex justify-between items-start">
            <div>
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                    {user.name}
                </h3>
                <div class="mt-1 flex items-center">
                    {#if user.maker}
                        <span
                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                            Repairer
                        </span>
                    {/if}
                    <span
                        class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                    >
                        Customer
                    </span>
                </div>
                <p class="mt-2 max-w-2xl text-sm text-gray-500">
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
        <div class="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl class="sm:divide-y sm:divide-gray-200">
                {#if user.skills}
                    <div
                        class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
                    >
                        <dt class="text-sm font-medium text-gray-500">
                            Skills
                        </dt>
                        <dd
                            class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2"
                        >
                            {user.skills}
                        </dd>
                    </div>
                {/if}

                <div
                    class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
                >
                    <dt class="text-sm font-medium text-gray-500">
                        Contact Information
                    </dt>
                    <dd
                        class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2"
                    >
                        {#if canViewContact}
                            <div class="space-y-1">
                                <p>
                                    <span class="font-medium">Email:</span>
                                    {user.email}
                                </p>
                                <p>
                                    <span class="font-medium">Phone:</span>
                                    {user.phoneNumber || "Not provided"}
                                </p>
                            </div>
                        {:else}
                            <div class="flex items-center space-x-4">
                                <p class="text-gray-500 italic">
                                    Hidden to protect privacy.
                                </p>

                                <form
                                    action="?/requestContact"
                                    method="POST"
                                    use:enhance
                                >
                                    {#if requestPending}
                                        <button
                                            disabled
                                            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-400 bg-gray-50 cursor-not-allowed"
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
                                            class="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            Request Contact Info
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
</div>
