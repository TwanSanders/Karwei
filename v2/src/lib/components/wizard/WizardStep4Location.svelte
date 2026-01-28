<script lang="ts">
    import LocationPicker from "$lib/components/LocationPicker.svelte";

    export let lat: number | null = null;
    export let long: number | null = null;
    export let onChange: (lat: number | null, long: number | null) => void;

    // React to changes from LocationPicker
    $: onChange(lat, long);
</script>

<div class="space-y-6">
    <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Where should the repair be done?
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
            Set the location where the repairer should come to fix your item
        </p>
    </div>

    <div
        class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
    >
        <div class="flex">
            <div class="flex-shrink-0">
                <svg
                    class="h-5 w-5 text-blue-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fill-rule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clip-rule="evenodd"
                    />
                </svg>
            </div>
            <div class="ml-3">
                <p class="text-sm text-blue-700 dark:text-blue-300">
                    This could be your home, office, or any other location where
                    the item is located.
                </p>
            </div>
        </div>
    </div>

    <LocationPicker bind:lat bind:long readonly={false} />
</div>
