<script lang="ts">
    import LocationPicker from "$lib/components/LocationPicker.svelte";

    import type { Skill } from "$lib/domain/types";

    export let availableSkills: Skill[] = [];
    export let formData: {
        category: string;
        title: string;
        description: string;
        price: string;
        imagePreviewUrl: string | null;
        lat: number | null;
        long: number | null;
    };
    export let onEdit: (step: number) => void;

    $: categoryName =
        availableSkills.find((s) => s.id === formData.category)?.name ||
        formData.category;
</script>

<div class="space-y-6">
    <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Review your request
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
            Make sure everything looks correct before posting
        </p>
    </div>

    <!-- Category -->
    <div
        class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm"
    >
        <div class="flex justify-between items-start">
            <div class="flex-1">
                <h3
                    class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1"
                >
                    Category
                </h3>
                <p class="text-lg font-semibold text-gray-900 dark:text-white">
                    {categoryName}
                </p>
            </div>
            <button
                type="button"
                on:click={() => onEdit(1)}
                class="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
            >
                Edit
            </button>
        </div>
    </div>

    <!-- Task Details -->
    <div
        class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm"
    >
        <div class="flex justify-between items-start mb-3">
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
                Task Details
            </h3>
            <button
                type="button"
                on:click={() => onEdit(2)}
                class="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
            >
                Edit
            </button>
        </div>
        <div class="space-y-2">
            <div>
                <p class="text-xs text-gray-500 dark:text-gray-400">Title</p>
                <p class="text-base font-medium text-gray-900 dark:text-white">
                    {formData.title}
                </p>
            </div>
            <div>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                    Description
                </p>
                <p class="text-sm text-gray-700 dark:text-gray-300">
                    {formData.description}
                </p>
            </div>
            {#if formData.price}
                <div>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                        Target Price
                    </p>
                    <p
                        class="text-base font-medium text-gray-900 dark:text-white"
                    >
                        €{formData.price}
                    </p>
                </div>
            {/if}
        </div>
    </div>

    <!-- Media -->
    <div
        class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm"
    >
        <div class="flex justify-between items-start mb-3">
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
                Photo
            </h3>
            <button
                type="button"
                on:click={() => onEdit(3)}
                class="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
            >
                Edit
            </button>
        </div>
        {#if formData.imagePreviewUrl}
            <img
                src={formData.imagePreviewUrl}
                alt="Preview"
                class="w-full max-h-48 object-cover rounded-lg"
            />
        {:else}
            <p class="text-sm text-gray-500 dark:text-gray-400 italic">
                No photo added
            </p>
        {/if}
    </div>

    <!-- Location -->
    <div
        class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm"
    >
        <div class="flex justify-between items-start mb-3">
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
                Location
            </h3>
            <button
                type="button"
                on:click={() => onEdit(4)}
                class="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
            >
                Edit
            </button>
        </div>
        {#if formData.lat && formData.long}
            <div
                class="h-64 mt-2 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600"
            >
                <LocationPicker
                    lat={formData.lat}
                    long={formData.long}
                    readonly={true}
                />
            </div>
        {:else}
            <p class="text-sm text-gray-500 dark:text-gray-400 italic">
                No location set
            </p>
        {/if}
    </div>

    <!-- Spacer for bottom navigation -->
    <div class="h-4"></div>
</div>
