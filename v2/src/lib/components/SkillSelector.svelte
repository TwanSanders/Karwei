<script lang="ts">
    // Props
    export let selectedSkills: string = ""; // Comma-separated string or empty
    export let availableSkills: string[] = []; // Skills from database

    // Parse selected skills into array
    let skillsArray: string[] = selectedSkills
        ? selectedSkills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
        : [];

    // Toggle skill selection
    function toggleSkill(skill: string) {
        const index = skillsArray.indexOf(skill);
        if (index > -1) {
            skillsArray = skillsArray.filter((s) => s !== skill);
        } else {
            skillsArray = [...skillsArray, skill];
        }
    }

    // Reactive: Update string value for form submission
    $: selectedSkills = skillsArray.join(",");
</script>

<div class="space-y-2">
    <div class="flex flex-wrap gap-2">
        {#each availableSkills as skill}
            <label
                class="relative inline-flex items-center px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-all select-none {skillsArray.includes(
                    skill,
                )
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-400 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-gray-50 dark:hover:bg-gray-750'}"
            >
                <input
                    type="checkbox"
                    checked={skillsArray.includes(skill)}
                    on:change={() => toggleSkill(skill)}
                    class="sr-only"
                />
                <span
                    class="text-sm font-medium transition-colors {skillsArray.includes(
                        skill,
                    )
                        ? 'text-indigo-700 dark:text-indigo-300'
                        : 'text-gray-700 dark:text-gray-300'}"
                >
                    {skill}
                </span>
                {#if skillsArray.includes(skill)}
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

    <!-- Hidden input for form submission -->
    <input type="hidden" name="skills" value={selectedSkills} />
</div>
