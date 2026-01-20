<script lang="ts">
    import type { ActionData, PageData } from "./$types";
    export let form: ActionData;
    export let data: PageData;
</script>

<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="md:grid md:grid-cols-3 md:gap-6">
        <div class="md:col-span-1">
            <h3
                class="text-lg font-medium leading-6 text-gray-900 dark:text-white"
            >
                Create a Repair Request
            </h3>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Describe the item you need fixed. Be as detailed as possible to
                get the best offers.
            </p>
        </div>
        <div class="mt-5 md:mt-0 md:col-span-2">
            <form
                method="POST"
                action="?/create"
                class="shadow-lg sm:rounded-lg sm:overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                enctype="multipart/form-data"
            >
                <div class="px-4 py-5 space-y-6 sm:p-6">
                    <div>
                        <label
                            for="title"
                            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                            Title
                        </label>
                        <div class="mt-1">
                            <input
                                type="text"
                                name="title"
                                id="title"
                                class="shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-2.5 transition-all"
                                placeholder="e.g. Broken Toaster"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            for="description"
                            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                            Description
                        </label>
                        <div class="mt-1">
                            <textarea
                                id="description"
                                name="description"
                                rows="3"
                                class="shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-2.5 transition-all"
                                placeholder="Describe the problem..."
                                required
                            ></textarea>
                        </div>
                    </div>

                    <div>
                        <label
                            for="type"
                            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                            Category
                        </label>
                        <div class="mt-1">
                            <select
                                id="type"
                                name="type"
                                class="shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2.5 transition-all cursor-pointer"
                            >
                                {#if data.skills && data.skills.length > 0}
                                    {#each data.skills as skill}
                                        <option value={skill.name}
                                            >{skill.name}</option
                                        >
                                    {/each}
                                {:else}
                                    <option value="Electronics"
                                        >Electronics</option
                                    >
                                    <option value="Furniture">Furniture</option>
                                    <option value="Clothing">Clothing</option>
                                    <option value="Bicycles">Bicycles</option>
                                    <option value="Appliances"
                                        >Appliances</option
                                    >
                                    <option value="Other">Other</option>
                                {/if}
                            </select>
                        </div>
                        <p
                            class="mt-1 text-xs text-gray-500 dark:text-gray-400"
                        >
                            Select the category that best matches your item
                        </p>
                    </div>

                    <div>
                        <label
                            for="price"
                            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                            Target Price (€)
                        </label>
                        <div class="mt-1 relative rounded-lg shadow-sm">
                            <div
                                class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
                            >
                                <span
                                    class="text-gray-500 dark:text-gray-400 sm:text-sm"
                                    >€</span
                                >
                            </div>
                            <input
                                type="number"
                                name="price"
                                id="price"
                                class="focus:ring-2 focus:ring-indigo-500 focus:border-transparent block w-full pl-8 pr-12 sm:text-sm border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 py-2.5 transition-all"
                                placeholder="0.00"
                                step="0.01"
                            />
                        </div>
                        <p
                            class="mt-1 text-xs text-gray-500 dark:text-gray-400"
                        >
                            Optional - What you're willing to pay
                        </p>
                    </div>

                    <div>
                        <label
                            for="image"
                            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                            Photo
                        </label>
                        <div class="mt-1">
                            <input
                                type="file"
                                name="image"
                                id="image"
                                accept="image/*"
                                class="block w-full text-sm text-gray-900 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 dark:file:bg-indigo-900/30 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/50 file:cursor-pointer file:transition-colors bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2"
                            />
                        </div>
                        <p
                            class="mt-2 text-xs text-gray-500 dark:text-gray-400"
                        >
                            Upload a photo of the item (optional)
                        </p>
                    </div>
                </div>
                <div
                    class="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 text-right sm:px-6 border-t border-gray-200 dark:border-gray-600"
                >
                    <button
                        type="submit"
                        class="inline-flex justify-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:ring-offset-gray-800 focus:ring-indigo-500 transition-colors"
                    >
                        Post Request
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
