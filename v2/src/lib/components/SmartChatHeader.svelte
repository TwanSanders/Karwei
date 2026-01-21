<script lang="ts">
    import type { User, Post } from "$lib/domain/types";
    import { User as UserIcon, Briefcase, ChevronDown } from "lucide-svelte";

    let { partner, activeJobs = [] }: { partner: User; activeJobs: Post[] } =
        $props();

    let showJobsDrawer = $state(false);

    function formatPrice(price: number | null | undefined): string {
        if (!price) return "Price not set";
        return `€${price.toFixed(2)}`;
    }
</script>

<header
    class="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
>
    {#if activeJobs.length === 0}
        <!-- No Active Jobs: Show Partner Profile -->
        <div class="flex items-center gap-3 p-4">
            {#if partner.image}
                <img
                    src={partner.image}
                    alt={partner.name}
                    class="w-12 h-12 rounded-full object-cover"
                />
            {:else}
                <div
                    class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center"
                >
                    <UserIcon
                        class="w-6 h-6 text-blue-600 dark:text-blue-300"
                    />
                </div>
            {/if}
            <div class="flex-1 min-w-0">
                <h1
                    class="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate"
                >
                    {partner.name}
                </h1>
                {#if partner.bio}
                    <p
                        class="text-sm text-gray-600 dark:text-gray-400 truncate"
                    >
                        {partner.bio}
                    </p>
                {/if}
            </div>
        </div>
    {:else if activeJobs.length === 1}
        <!-- One Active Job: Show Job Details -->
        <button
            type="button"
            onclick={() => {
                showJobsDrawer = !showJobsDrawer;
            }}
            class="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors md:cursor-default md:hover:bg-transparent"
        >
            <div class="flex items-start gap-3">
                <div
                    class="flex-shrink-0 w-10 h-10 rounded bg-green-100 dark:bg-green-900 flex items-center justify-center"
                >
                    <Briefcase
                        class="w-5 h-5 text-green-600 dark:text-green-300"
                    />
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-2">
                        <h2
                            class="text-sm font-medium text-gray-900 dark:text-gray-100"
                        >
                            Active Job
                        </h2>
                        <span
                            class="text-sm font-semibold text-green-600 dark:text-green-400"
                        >
                            {formatPrice(activeJobs[0].targetPrice)}
                        </span>
                    </div>
                    <p
                        class="text-sm text-gray-600 dark:text-gray-400 truncate mt-0.5"
                    >
                        {activeJobs[0].title}
                    </p>
                    {#if partner.name}
                        <p
                            class="text-xs text-gray-500 dark:text-gray-500 mt-1"
                        >
                            with {partner.name}
                        </p>
                    {/if}
                </div>
                <ChevronDown
                    class="w-5 h-5 text-gray-400 md:hidden transition-transform {showJobsDrawer
                        ? 'rotate-180'
                        : ''}"
                />
            </div>
        </button>
    {:else}
        <!-- Multiple Active Jobs: Show Count with Drawer Toggle -->
        <button
            type="button"
            onclick={() => {
                showJobsDrawer = !showJobsDrawer;
            }}
            class="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div
                        class="flex-shrink-0 w-10 h-10 rounded bg-green-100 dark:bg-green-900 flex items-center justify-center"
                    >
                        <Briefcase
                            class="w-5 h-5 text-green-600 dark:text-green-300"
                        />
                    </div>
                    <div>
                        <h2
                            class="text-sm font-medium text-gray-900 dark:text-gray-100"
                        >
                            {activeJobs.length} Active Jobs
                        </h2>
                        <p class="text-xs text-gray-500 dark:text-gray-500">
                            with {partner.name}
                        </p>
                    </div>
                </div>
                <ChevronDown
                    class="w-5 h-5 text-gray-400 transition-transform {showJobsDrawer
                        ? 'rotate-180'
                        : ''}"
                />
            </div>
        </button>
    {/if}

    <!-- Jobs Drawer/Modal (Mobile) -->
    {#if showJobsDrawer && activeJobs.length > 0}
        <div
            class="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
        >
            <div class="max-h-[40vh] overflow-y-auto p-4 space-y-3">
                {#each activeJobs as job}
                    <a
                        href="/post/{job.id}"
                        class="block p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
                    >
                        <div class="flex justify-between items-start gap-2">
                            <div class="flex-1 min-w-0">
                                <h3
                                    class="font-medium text-gray-900 dark:text-gray-100 truncate"
                                >
                                    {job.title}
                                </h3>
                                <p
                                    class="text-xs text-gray-500 dark:text-gray-400 mt-1"
                                >
                                    Status: <span class="capitalize"
                                        >{job.status.replace("_", " ")}</span
                                    >
                                </p>
                            </div>
                            <span
                                class="text-sm font-semibold text-green-600 dark:text-green-400"
                            >
                                {formatPrice(job.targetPrice)}
                            </span>
                        </div>
                    </a>
                {/each}
            </div>
        </div>
    {/if}
</header>
