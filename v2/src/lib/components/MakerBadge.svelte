<script lang="ts">
    export let level: "novice" | "handyman" | "master" | undefined = undefined;
    export let showRepairer: boolean = false;

    const badges = {
        novice: {
            label: "Novice",
            color: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200",
        },
        handyman: {
            label: "Handyman",
            color: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200",
        },
        master: {
            label: "Master",
            color: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200",
        },
    };

    $: badge = level
        ? {
              ...badges[level],
              label: showRepairer
                  ? `${badges[level].label} Repairer`
                  : badges[level].label,
          }
        : null;
</script>

{#if badge}
    <span
        class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}
    >
        {badge.label}
    </span>
{/if}
