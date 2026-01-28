<script lang="ts">
    import type { ActionData, PageData } from "./$types";
    import InfoTooltip from "$lib/components/InfoTooltip.svelte";
    import LocationPicker from "$lib/components/LocationPicker.svelte";
    import PasswordInput from "$lib/components/PasswordInput.svelte";
    import SkillSelector from "$lib/components/SkillSelector.svelte";

    export let form: ActionData;
    export let data: PageData;

    let isMaker = false;
    let selectedSkillIds: string[] = [];

    $: skillIdsJson = JSON.stringify(selectedSkillIds);
</script>

<div class="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2
            class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white"
        >
            Create a new account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or
            <a
                href="/login"
                class="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
            >
                sign in to existing account
            </a>
        </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div
            class="bg-white dark:bg-gray-800 py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-gray-200 dark:border-gray-700"
        >
            <form class="space-y-6" method="POST" enctype="multipart/form-data">
                <div>
                    <label
                        for="name"
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
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
                            class="appearance-none block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm"
                            value={form?.name ?? ""}
                        />
                    </div>
                </div>

                <div>
                    <label
                        for="email"
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                        Email address
                        <InfoTooltip
                            text="Used for login and important updates. Never sold to third parties."
                        />
                    </label>
                    <div class="mt-1">
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autocomplete="email"
                            required
                            class="appearance-none block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm"
                            value={form?.email ?? ""}
                        />
                    </div>
                </div>

                <div>
                    <label
                        for="phoneNumber"
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                        Phone Number
                        <InfoTooltip
                            text="Only shared with a user AFTER you accept their contact request. Kept hidden by default."
                        />
                    </label>
                    <div class="mt-1">
                        <input
                            id="phoneNumber"
                            name="phoneNumber"
                            type="tel"
                            autocomplete="tel"
                            required
                            class="appearance-none block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm"
                            value={form?.phoneNumber ?? ""}
                        />
                    </div>
                </div>

                <div>
                    <label
                        for="image"
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                        Profile Picture
                    </label>
                    <div class="mt-1">
                        <input
                            id="image"
                            name="image"
                            type="file"
                            accept="image/*"
                            class="block w-full text-sm text-gray-900 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 dark:file:bg-indigo-900/30 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/50 file:cursor-pointer file:transition-colors bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2"
                        />
                    </div>
                </div>

                <div>
                    <PasswordInput
                        id="password"
                        name="password"
                        label="Password"
                        required
                        autocomplete="new-password"
                    />
                </div>

                <div>
                    <PasswordInput
                        id="confirmPassword"
                        name="confirmPassword"
                        label="Confirm Password"
                        required
                        autocomplete="new-password"
                    />
                </div>

                <div>
                    <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                        Home Location
                        <InfoTooltip
                            text="Used to show you repairs/makers in your neighborhood. We calculate distance but never reveal your exact home address."
                        />
                    </label>
                    <div class="mt-1">
                        <LocationPicker />
                    </div>
                </div>

                <div>
                    <span
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >I want to...</span
                    >
                    <div class="mt-2 space-y-3">
                        <div
                            class="flex items-start p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50"
                        >
                            <div class="flex items-center h-5">
                                <input
                                    id="role_customer"
                                    name="role_customer"
                                    type="checkbox"
                                    checked
                                    class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 dark:text-indigo-500 border-gray-300 dark:border-gray-500 rounded transition-colors"
                                    disabled
                                />
                            </div>
                            <div class="ml-3 text-sm">
                                <label
                                    for="role_customer"
                                    class="font-medium text-gray-900 dark:text-gray-100"
                                    >Get things repaired</label
                                >
                                <p class="text-gray-500 dark:text-gray-400">
                                    I have broken items I want to fix.
                                </p>
                            </div>
                        </div>
                        <div
                            class="flex items-start p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700/70 transition-colors cursor-pointer"
                        >
                            <div class="flex items-center h-5">
                                <input
                                    id="role_maker"
                                    name="role_maker"
                                    type="checkbox"
                                    bind:checked={isMaker}
                                    class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 dark:text-indigo-500 border-gray-300 dark:border-gray-500 rounded transition-colors cursor-pointer"
                                />
                            </div>
                            <div class="ml-3 text-sm">
                                <label
                                    for="role_maker"
                                    class="font-medium text-gray-900 dark:text-gray-100 cursor-pointer"
                                    >Repair things</label
                                >
                                <p class="text-gray-500 dark:text-gray-400">
                                    I want to offer my skills to fix items for
                                    others. You can set your skills in your
                                    profile after registration.
                                </p>
                            </div>
                        </div>
                        {#if isMaker}
                            <div
                                class="mt-4 pl-4 border-l-2 border-indigo-200 dark:border-indigo-800 ml-2"
                            >
                                <label
                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                >
                                    Your Skills
                                    <span
                                        class="text-xs text-gray-500 font-normal ml-1"
                                        >(Select all that apply)</span
                                    >
                                </label>
                                <SkillSelector
                                    availableSkills={data.skills}
                                    bind:selectedSkills={selectedSkillIds}
                                />
                                <input
                                    type="hidden"
                                    name="skillIds"
                                    value={skillIdsJson}
                                />
                            </div>
                        {/if}
                    </div>
                </div>

                {#if form?.userExists}
                    <div
                        class="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800"
                    >
                        <div class="flex">
                            <div class="ml-3">
                                <h3
                                    class="text-sm font-medium text-red-800 dark:text-red-300"
                                >
                                    User already exists with this email
                                </h3>
                            </div>
                        </div>
                    </div>
                {/if}

                {#if form?.passwordMismatch}
                    <div
                        class="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800"
                    >
                        <div class="flex">
                            <div class="ml-3">
                                <h3
                                    class="text-sm font-medium text-red-800 dark:text-red-300"
                                >
                                    Passwords do not match
                                </h3>
                            </div>
                        </div>
                    </div>
                {/if}

                <div>
                    <button
                        type="submit"
                        class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:ring-offset-gray-800 focus:ring-indigo-500 transition-colors"
                    >
                        Register
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
