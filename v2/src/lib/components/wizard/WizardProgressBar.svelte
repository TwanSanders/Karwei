<script lang="ts">
    export let currentStep: number;
    export let totalSteps: number = 5;

    const stepLabels = ["Category", "Details", "Media", "Location", "Review"];
</script>

<div class="mb-8">
    <div class="flex items-center justify-between">
        {#each Array(totalSteps) as _, index}
            {@const stepNum = index + 1}
            {@const isCompleted = stepNum < currentStep}
            {@const isCurrent = stepNum === currentStep}
            {@const isUpcoming = stepNum > currentStep}

            <div class="flex flex-col items-center flex-1">
                <!-- Step Circle -->
                <div
                    class="relative flex items-center justify-center w-10 h-10 rounded-full transition-all
                    {isCompleted ? 'bg-indigo-600 dark:bg-indigo-500' : ''}
                    {isCurrent
                        ? 'bg-indigo-600 dark:bg-indigo-500 ring-4 ring-indigo-100 dark:ring-indigo-900/50'
                        : ''}
                    {isUpcoming ? 'bg-gray-200 dark:bg-gray-700' : ''}"
                >
                    {#if isCompleted}
                        <svg
                            class="w-6 h-6 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fill-rule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clip-rule="evenodd"
                            />
                        </svg>
                    {:else}
                        <span
                            class="text-sm font-semibold
                            {isCurrent
                                ? 'text-white'
                                : 'text-gray-500 dark:text-gray-400'}"
                        >
                            {stepNum}
                        </span>
                    {/if}
                </div>

                <!-- Step Label (hidden on mobile) -->
                <span
                    class="hidden sm:block mt-2 text-xs font-medium
                    {isCurrent
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-500 dark:text-gray-400'}"
                >
                    {stepLabels[index]}
                </span>
            </div>

            <!-- Connector Line -->
            {#if index < totalSteps - 1}
                <div
                    class="flex-1 h-0.5 mx-2 transition-all
                    {stepNum < currentStep
                        ? 'bg-indigo-600 dark:bg-indigo-500'
                        : 'bg-gray-200 dark:bg-gray-700'}"
                ></div>
            {/if}
        {/each}
    </div>

    <!-- Current Step Label (visible on mobile) -->
    <div class="sm:hidden text-center mt-3">
        <span class="text-sm font-medium text-indigo-600 dark:text-indigo-400">
            {stepLabels[currentStep - 1]}
        </span>
    </div>
</div>
