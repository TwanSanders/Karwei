<script lang="ts">
    import InfoTooltip from "$lib/components/InfoTooltip.svelte";

    export let availableSkills: Array<{ id: string; name: string }>;
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
        {#each availableSkills as skill}
            <button
                type="button"
                on:click={() => {
                    selectedCategory = skill.name;
                    onSelect(skill.name);
                }}
                class="relative flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all select-none
                    {selectedCategory === skill.name
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-400 shadow-md scale-105'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-gray-50 dark:hover:bg-gray-750 hover:scale-102'}"
            >
                <span class="text-4xl mb-3">
                    {#if skill.name === "Electronics"}
                        🔌
                    {:else if skill.name === "Woodwork"}
                        🪵
                    {:else if skill.name === "Textile"}
                        🧵
                    {:else if skill.name === "Metalwork"}
                        🔩
                    {:else if skill.name === "Appliances"}
                        🔧
                    {:else if skill.name === "Plumbing"}
                        🚰
                    {:else if skill.name === "Electrical"}
                        ⚡
                    {:else if skill.name === "Bicycle Repair"}
                        🚴
                    {:else if skill.name === "Automotive"}
                        🚗
                    {:else if skill.name === "Jewelry"}
                        💍
                    {:else if skill.name === "Leather"}
                        👜
                    {:else if skill.name === "Musical Instruments"}
                        🎸
                    {:else if skill.name === "Ceramics & Glass"}
                        🏺
                    {:else if skill.name === "Gardening Tools"}
                        🌱
                    {:else if skill.name === "General Handyman"}
                        🛠️
                    {:else if skill.name === "Furniture"}
                        🪑
                    {:else if skill.name === "Clothing"}
                        👕
                    {:else if skill.name === "Bicycles"}
                        🚲
                    {:else}
                        🔧
                    {/if}
                </span>
                <span
                    class="text-sm font-medium text-center transition-colors
                    {selectedCategory === skill.name
                        ? 'text-indigo-700 dark:text-indigo-300'
                        : 'text-gray-700 dark:text-gray-300'}"
                >
                    {skill.name}
                </span>

                {#if selectedCategory === skill.name}
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
