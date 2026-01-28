<script lang="ts">
    import type { Skill } from "$lib/domain/types";
    import { getCategoryIcon } from "$lib/config/categoryIcons";

    export let selectedSkills: string[] = []; // Array of skill IDs
    export let availableSkills: Skill[] = [];

    function toggleSkill(skillId: string) {
        if (selectedSkills.includes(skillId)) {
            selectedSkills = selectedSkills.filter((id) => id !== skillId);
        } else {
            selectedSkills = [...selectedSkills, skillId];
        }
    }
</script>

<div class="space-y-2">
    <div class="flex flex-wrap gap-2">
        {#each availableSkills as skill}
            <label
                class="relative inline-flex items-center px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-all select-none
                {selectedSkills.includes(skill.id)
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-400 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-gray-50 dark:hover:bg-gray-750'}"
            >
                <input
                    type="checkbox"
                    checked={selectedSkills.includes(skill.id)}
                    on:change={() => toggleSkill(skill.id)}
                    class="sr-only"
                />
                <span class="text-lg mr-2">{getCategoryIcon(skill.name)}</span>
                <span
                    class="text-sm font-medium transition-colors
                    {selectedSkills.includes(skill.id)
                        ? 'text-indigo-700 dark:text-indigo-300'
                        : 'text-gray-700 dark:text-gray-300'}"
                >
                    {skill.name}
                </span>
                {#if selectedSkills.includes(skill.id)}
                    <svg
                        class="ml-2 h-4 w-4 text-indigo-600 dark:text-indigo-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fill-rule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clip-rule="evenodd"
                        />
                    </svg>
                {/if}
            </label>
        {/each}
    </div>
</div>
