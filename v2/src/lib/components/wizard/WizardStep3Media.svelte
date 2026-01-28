<script lang="ts">
    export let imageFile: File | null = null;
    export let imagePreviewUrl: string | null = null;
    export let onFileSelect: (file: File | null) => void;

    let fileInput: HTMLInputElement;

    function handleFileChange(event: Event) {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0] || null;

        if (file) {
            // Create preview URL
            const reader = new FileReader();
            reader.onload = (e) => {
                onFileSelect(file);
            };
            reader.readAsDataURL(file);
        } else {
            onFileSelect(null);
        }
    }

    function removeImage() {
        imageFile = null;
        imagePreviewUrl = null;
        onFileSelect(null);
        if (fileInput) {
            fileInput.value = "";
        }
    }
</script>

<div class="space-y-6">
    <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Add a photo
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
            A picture helps repairers understand the issue (optional)
        </p>
    </div>

    {#if imagePreviewUrl}
        <div class="relative">
            <img
                src={imagePreviewUrl}
                alt="Preview"
                class="w-full max-h-96 object-cover rounded-lg shadow-lg"
            />
            <button
                type="button"
                on:click={removeImage}
                aria-label="Remove image"
                class="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-colors"
            >
                <svg
                    class="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
            </button>
        </div>
    {:else}
        <div
            class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center bg-gray-50 dark:bg-gray-800/50 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors"
        >
            <svg
                class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
            >
                <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </svg>
            <div class="mt-4">
                <label for="image-upload" class="cursor-pointer">
                    <span
                        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors"
                    >
                        Choose image
                    </span>
                    <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        bind:this={fileInput}
                        on:change={handleFileChange}
                        class="sr-only"
                    />
                </label>
            </div>
            <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                PNG, JPG, GIF up to 10MB
            </p>
        </div>
    {/if}
</div>
