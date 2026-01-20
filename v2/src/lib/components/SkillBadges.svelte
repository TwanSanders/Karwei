<script lang="ts">
    // Props
    export let skills: string | null | undefined = "";
    export let size: "small" | "normal" = "normal";

    // Parse skills string into array
    $: skillsArray = skills
        ? skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
        : [];
</script>

{#if skillsArray.length > 0}
    <div class="flex flex-wrap gap-1.5">
        {#each skillsArray as skill}
            <span
                class={`inline-flex items-center rounded-full font-medium bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200 ${
                    size === "small"
                        ? "px-2 py-0.5 text-xs"
                        : "px-2.5 py-0.5 text-xs"
                }`}
            >
                {skill}
            </span>
        {/each}
    </div>
{:else}
    <span class="text-sm text-gray-500 dark:text-gray-400 italic">
        No skills specified
    </span>
{/if}
