<script lang="ts">
    import InfoTooltip from "$lib/components/InfoTooltip.svelte";
    import type { Skill } from "$lib/domain/types";
    import { getCategoryIcon } from "$lib/config/categoryIcons";

    export let availableSkills: Skill[];
    export let selectedCategory: string = "";
    export let onSelect: (category: string) => void;
</script>

<div class="space-y-4">
    <div>
        <h2
            class="text-2xl font-bold text-gray-900 dark:text-white mb-2 inline-flex items-center"
        >
            What needs to be repaired?
            <InfoTooltip
                text="Choose the category that best describes your item. This helps us match you with the right repairers."
            />
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
            Select the category that best matches your item
        </p>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
        <!-- AI Helper Option -->
        <a
            href="/post/ai-assistant"
            class="relative flex flex-col items-center justify-center p-6 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all select-none col-span-2 sm:col-span-3 mb-2 group"
        >
            <span class="text-3xl mb-2">🤖</span>
            <span
                class="text-base font-semibold text-indigo-900 dark:text-indigo-100"
            >
                Not sure? Use AI Assistant
            </span>
            <span
                class="text-xs text-indigo-700 dark:text-indigo-300 text-center px-4"
            >
                Chat with our smart helper to diagnose your issue and create a
                perfect post.
            </span>
            <span
                class="absolute top-3 right-3 text-indigo-400 dark:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fill-rule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clip-rule="evenodd"
                    />
                </svg>
            </span>
        </a>

        {#each availableSkills as skill}
            <button
                type="button"
                on:click={() => {
                    selectedCategory = skill.id;
                    onSelect(skill.id);
                }}
                class="relative flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all select-none
                    {selectedCategory === skill.id
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-400 shadow-md scale-105'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-gray-50 dark:hover:bg-gray-750 hover:scale-102'}"
            >
                <span class="text-4xl mb-3">
                    {getCategoryIcon(skill.name)}
                </span>
                <span
                    class="text-sm font-medium text-center transition-colors
                    {selectedCategory === skill.id
                        ? 'text-indigo-700 dark:text-indigo-300'
                        : 'text-gray-700 dark:text-gray-300'}"
                >
                    {skill.name}
                </span>

                {#if selectedCategory === skill.id}
                    <div class="absolute top-2 right-2">
                        <svg
                            class="w-5 h-5 text-indigo-600 dark:text-indigo-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clip-rule="evenodd"
                            />
                        </svg>
                    </div>
                {/if}
            </button>
        {/each}
    </div>
</div>
