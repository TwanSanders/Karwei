<script lang="ts">
    import type { Skill } from "$lib/domain/types";
    import { getCategoryIcon } from "$lib/config/categoryIcons";

    export let skills: Skill[] = [];
    export let size: "small" | "normal" = "normal";
</script>

{#if skills.length > 0}
    <div class="flex flex-wrap gap-1.5">
        {#each skills as skill}
            <span
                class={`inline-flex items-center rounded-full font-medium bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200 ${
                    size === "small"
                        ? "px-2 py-0.5 text-xs"
                        : "px-2.5 py-0.5 text-xs"
                }`}
            >
                <span class="mr-1">{getCategoryIcon(skill.name)}</span>
                {skill.name}
            </span>
        {/each}
    </div>
{:else}
    <span class="text-sm text-gray-500 dark:text-gray-400 italic">
        No skills specified
    </span>
{/if}
