<script lang="ts">
    import { Info } from "lucide-svelte";

    export let text: string;
</script>

<div class="group relative inline-block ml-2 align-middle">
    <button
        type="button"
        class="text-gray-400 hover:text-gray-600 focus:outline-none"
    >
        <Info class="h-4 w-4" />
    </button>
    <div
        class="absolute bottom-full left-1/2 z-10 mb-2 hidden w-48 -translate-x-1/2 transform rounded-md bg-gray-900 px-3 py-2 text-xs text-white opacity-0 transition-opacity duration-300 group-hover:block group-hover:opacity-100 group-focus:block group-focus:opacity-100 pointer-events-none"
    >
        {text}
        <div
            class="absolute top-100 left-1/2 -mt-1 -ml-1 h-2 w-2 -rotate-45 transform bg-gray-900"
        ></div>
    </div>
</div>
