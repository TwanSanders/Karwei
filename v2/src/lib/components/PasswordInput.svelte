<script lang="ts">
    import { Eye, EyeOff } from "lucide-svelte";

    export let value = "";
    export let name = "password";
    export let id = "password";
    export let label = "Password";
    export let placeholder = "";
    export let required = true;
    export let autocomplete = "current-password";
    export let error: string | undefined = undefined;

    let showPassword = false;
</script>

<div>
    <label
        for={id}
        class="block text-sm font-medium text-gray-700 dark:text-gray-300"
    >
        {label}
    </label>
    <div class="mt-1 relative rounded-md shadow-sm">
        <input
            {id}
            {name}
            type={showPassword ? "text" : "password"}
            {autocomplete}
            {required}
            class="appearance-none block w-full px-3 py-2 border {error
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-10"
            {placeholder}
            bind:value
        />
        <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
                type="button"
                class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none cursor-pointer"
                on:mousedown={() => (showPassword = true)}
                on:mouseup={() => (showPassword = false)}
                on:mouseleave={() => (showPassword = false)}
                on:touchstart|preventDefault={() => (showPassword = true)}
                on:touchend|preventDefault={() => (showPassword = false)}
                aria-label={showPassword ? "Hide password" : "Show password"}
            >
                {#if showPassword}
                    <EyeOff class="h-5 w-5" />
                {:else}
                    <Eye class="h-5 w-5" />
                {/if}
            </button>
        </div>
    </div>
    {#if error}
        <p class="mt-2 text-sm text-red-600" id="{id}-error">{error}</p>
    {/if}
</div>
