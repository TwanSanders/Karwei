<script lang="ts">
    import { Info } from "lucide-svelte";
    export let text: string = "";
</script>

<div class="group relative inline-block ml-2 align-middle">
    <button
        type="button"
        class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
        aria-label="Level information"
    >
        <Info class="h-4 w-4" />
    </button>
    <div
        class="absolute top-full left-1/2 z-50 mt-2 hidden w-64 -translate-x-1/2 transform rounded-lg bg-gray-900 dark:bg-gray-800 px-4 py-3 text-sm text-white shadow-xl opacity-0 transition-all duration-200 group-hover:block group-hover:opacity-100 pointer-events-none border border-gray-700"
    >
        {#if text}
            {text}
        {:else}
            <slot></slot>
        {/if}
        <div
            class="absolute bottom-full left-1/2 -mb-2 -ml-2 h-4 w-4 rotate-45 transform bg-gray-900 dark:bg-gray-800 border-l border-t border-gray-700"
        ></div>
    </div>
</div>
