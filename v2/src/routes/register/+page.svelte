<script lang="ts">
    import type { ActionData } from "./$types";

    export let form: ActionData;
</script>

<div class="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create a new account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
            Or
            <a
                href="/login"
                class="font-medium text-indigo-600 hover:text-indigo-500"
            >
                sign in to existing account
            </a>
        </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form class="space-y-6" method="POST" enctype="multipart/form-data">
                <div>
                    <label
                        for="name"
                        class="block text-sm font-medium text-gray-700"
                    >
                        Name
                    </label>
                    <div class="mt-1">
                        <input
                            id="name"
                            name="name"
                            type="text"
                            autocomplete="name"
                            required
                            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={form?.name ?? ""}
                        />
                    </div>
                </div>

                <div>
                    <label
                        for="email"
                        class="block text-sm font-medium text-gray-700"
                    >
                        Email address
                    </label>
                    <div class="mt-1">
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autocomplete="email"
                            required
                            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={form?.email ?? ""}
                        />
                    </div>
                </div>

                <div>
                    <label
                        for="phoneNumber"
                        class="block text-sm font-medium text-gray-700"
                    >
                        Phone Number
                    </label>
                    <div class="mt-1">
                        <input
                            id="phoneNumber"
                            name="phoneNumber"
                            type="tel"
                            autocomplete="tel"
                            required
                            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={form?.phoneNumber ?? ""}
                        />
                    </div>
                </div>

                <div>
                    <label
                        for="image"
                        class="block text-sm font-medium text-gray-700"
                    >
                        Profile Picture
                    </label>
                    <div class="mt-1">
                        <input
                            id="image"
                            name="image"
                            type="file"
                            accept="image/*"
                            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                </div>

                <div>
                    <label
                        for="password"
                        class="block text-sm font-medium text-gray-700"
                    >
                        Password
                    </label>
                    <div class="mt-1">
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autocomplete="new-password"
                            required
                            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                </div>

                <div>
                    <span class="block text-sm font-medium text-gray-700"
                        >I want to...</span
                    >
                    <div class="mt-2 space-y-4">
                        <div class="flex items-start">
                            <div class="flex items-center h-5">
                                <input
                                    id="role_customer"
                                    name="role_customer"
                                    type="checkbox"
                                    checked
                                    class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                    disabled
                                />
                            </div>
                            <div class="ml-3 text-sm">
                                <label
                                    for="role_customer"
                                    class="font-medium text-gray-700"
                                    >Get things repaired</label
                                >
                                <p class="text-gray-500">
                                    I have broken items I want to fix.
                                </p>
                            </div>
                        </div>
                        <div class="flex items-start">
                            <div class="flex items-center h-5">
                                <input
                                    id="role_maker"
                                    name="role_maker"
                                    type="checkbox"
                                    class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                />
                            </div>
                            <div class="ml-3 text-sm">
                                <label
                                    for="role_maker"
                                    class="font-medium text-gray-700"
                                    >Repair things</label
                                >
                                <p class="text-gray-500">
                                    I want to offer my skills to fix items for
                                    others.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {#if form?.userExists}
                    <div class="rounded-md bg-red-50 p-4">
                        <div class="flex">
                            <div class="ml-3">
                                <h3 class="text-sm font-medium text-red-800">
                                    User already exists with this email
                                </h3>
                            </div>
                        </div>
                    </div>
                {/if}

                <div>
                    <button
                        type="submit"
                        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Register
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
