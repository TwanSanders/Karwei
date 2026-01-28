<script lang="ts">
    import InfoTooltip from "$lib/components/InfoTooltip.svelte";

    export let title: string = "";
    export let description: string = "";
    export let price: string = "";
    export let onChange: (field: string, value: string) => void;
    export let isFromAI: boolean = false;
</script>

{#if !isFromAI && !title && !description}
    <a
        href="/post/ai-assistant"
        class="flex items-center gap-3 p-4 mb-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors group"
    >
        <span class="text-2xl">🤖</span>
        <div class="flex-1">
            <p class="font-medium text-indigo-900 dark:text-indigo-100">
                Not sure what to write?
            </p>
            <p class="text-sm text-indigo-700 dark:text-indigo-300">
                Chat with our AI to help describe your problem
            </p>
        </div>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-indigo-400 group-hover:translate-x-1 transition-transform"
            viewBox="0 0 20 20"
            fill="currentColor"
        >
            <path
                fill-rule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clip-rule="evenodd"
            />
        </svg>
    </a>
{/if}

<div class="space-y-6">
    <div>
        <h2
            class="text-2xl font-bold text-gray-900 dark:text-white mb-2 inline-flex items-center"
        >
            Tell us about the task
            <InfoTooltip
                text="Be specific and detailed. Include what's broken, when it broke, and any troubleshooting you've tried."
            />
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
            Provide details about what needs to be fixed
        </p>
    </div>

    <div>
        <label
            for="title"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
            Title <span class="text-red-500">*</span>
        </label>
        <input
            type="text"
            id="title"
            bind:value={title}
            on:input={(e) => onChange("title", e.currentTarget.value)}
            class="shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent block w-full text-base sm:text-sm border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 transition-all"
            placeholder="e.g. Broken Toaster"
        />
    </div>

    <div>
        <label
            for="description"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
            Description <span class="text-red-500">*</span>
        </label>
        <textarea
            id="description"
            bind:value={description}
            on:input={(e) => onChange("description", e.currentTarget.value)}
            rows="5"
            class="shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent block w-full text-base sm:text-sm border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 transition-all"
            placeholder="Describe the problem in detail. What's broken? When did it break? Any relevant history?"
        ></textarea>
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Be as specific as possible to get accurate offers
        </p>
    </div>

    <div>
        <label
            for="price"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
            Target Price (€) <span class="text-gray-500 text-xs">Optional</span>
        </label>
        <div class="relative rounded-lg shadow-sm">
            <div
                class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
            >
                <span class="text-gray-500 dark:text-gray-400 sm:text-sm"
                    >€</span
                >
            </div>
            <input
                type="number"
                id="price"
                bind:value={price}
                on:input={(e) => onChange("price", e.currentTarget.value)}
                class="focus:ring-2 focus:ring-indigo-500 focus:border-transparent block w-full pl-8 pr-12 text-base sm:text-sm border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 py-3 transition-all"
                placeholder="0.00"
                step="0.01"
                min="0"
            />
        </div>
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            What you're willing to pay for the repair
        </p>
    </div>
</div>
