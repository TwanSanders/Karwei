<script lang="ts">
    import type { ActionData } from "./$types";
    export let form: ActionData;
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
                class="shadow sm:rounded-md sm:overflow-hidden bg-white dark:bg-gray-800"
                enctype="multipart/form-data"
            >
                <div class="px-4 py-5 space-y-6 sm:p-6">
                    <div>
                        <label
                            for="title"
                            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Title
                        </label>
                        <div class="mt-1">
                            <input
                                type="text"
                                name="title"
                                id="title"
                                class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="e.g. Broken Toaster"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            for="description"
                            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Description
                        </label>
                        <div class="mt-1">
                            <textarea
                                id="description"
                                name="description"
                                rows="3"
                                class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Describe the problem..."
                                required
                            ></textarea>
                        </div>
                    </div>

                    <div>
                        <label
                            for="type"
                            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Category
                        </label>
                        <div class="mt-1">
                            <select
                                id="type"
                                name="type"
                                class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="Electronics">Electronics</option>
                                <option value="Furniture">Furniture</option>
                                <option value="Clothing">Clothing</option>
                                <option value="Bicycles">Bicycles</option>
                                <option value="Appliances">Appliances</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label
                            for="price"
                            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Target Price (€)
                        </label>
                        <div class="mt-1 relative rounded-md shadow-sm">
                            <div
                                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                            >
                                <span class="text-gray-500 sm:text-sm">€</span>
                            </div>
                            <input
                                type="number"
                                name="price"
                                id="price"
                                class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="0.00"
                                step="0.01"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            for="image"
                            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Photo
                        </label>
                        <div class="mt-1">
                            <input
                                type="file"
                                name="image"
                                id="image"
                                accept="image/*"
                                class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                        <p class="mt-2 text-sm text-gray-500">
                            Upload a photo of the item (optional).
                        </p>
                    </div>
                </div>
                <div
                    class="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-right sm:px-6"
                >
                    <button
                        type="submit"
                        class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Post Request
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
