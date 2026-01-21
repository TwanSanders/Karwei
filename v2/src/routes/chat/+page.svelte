<script lang="ts">
    import type { PageData } from "./$types";
    import { MessageCircle, User as UserIcon } from "lucide-svelte";

    let { data }: { data: PageData } = $props();

    function formatLastMessageTime(date: Date): string {
        const now = new Date();
        const messageDate = new Date(date);
        const diffMs = now.getTime() - messageDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return messageDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    }

    function truncateMessage(content: string, maxLength: number = 60): string {
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength) + "...";
    }
</script>

<svelte:head>
    <title>Chats | Karwei</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div
            class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-6 sticky top-0 z-10"
        >
            <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Messages
            </h1>
        </div>

        <!-- Conversation List -->
        <div class="divide-y divide-gray-200 dark:divide-gray-700">
            {#if data.conversations.length === 0}
                <div
                    class="flex flex-col items-center justify-center py-16 px-4"
                >
                    <div
                        class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4"
                    >
                        <MessageCircle class="w-8 h-8 text-gray-400" />
                    </div>
                    <h2
                        class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2"
                    >
                        No conversations yet
                    </h2>
                    <p
                        class="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md"
                    >
                        Start conversations by accepting offers or contact
                        requests. Your messages will appear here.
                    </p>
                </div>
            {:else}
                {#each data.conversations as { conversation, partner, lastMessage } (conversation.id)}
                    <a
                        href="/chat/{partner.id}"
                        class="block bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <div class="flex items-start gap-4 p-4">
                            <!-- Partner Avatar -->
                            {#if partner.image}
                                <img
                                    src={partner.image}
                                    alt={partner.name}
                                    class="w-12 h-12 rounded-full object-cover flex-shrink-0"
                                />
                            {:else}
                                <div
                                    class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0"
                                >
                                    <UserIcon
                                        class="w-6 h-6 text-blue-600 dark:text-blue-300"
                                    />
                                </div>
                            {/if}

                            <!-- Conversation Info -->
                            <div class="flex-1 min-w-0">
                                <div
                                    class="flex items-baseline justify-between gap-2 mb-1"
                                >
                                    <h3
                                        class="font-semibold text-gray-900 dark:text-gray-100 truncate"
                                    >
                                        {partner.name}
                                    </h3>
                                    {#if lastMessage}
                                        <span
                                            class="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0"
                                        >
                                            {formatLastMessageTime(
                                                lastMessage.createdAt,
                                            )}
                                        </span>
                                    {/if}
                                </div>

                                {#if lastMessage}
                                    <p
                                        class="text-sm text-gray-600 dark:text-gray-400 truncate"
                                    >
                                        {#if lastMessage.type === "system_event"}
                                            <span class="italic"
                                                >🤝 {truncateMessage(
                                                    lastMessage.content,
                                                )}</span
                                            >
                                        {:else}
                                            {truncateMessage(
                                                lastMessage.content,
                                            )}
                                        {/if}
                                    </p>
                                {:else}
                                    <p
                                        class="text-sm text-gray-400 dark:text-gray-500 italic"
                                    >
                                        No messages yet
                                    </p>
                                {/if}

                                {#if partner.maker}
                                    <span
                                        class="inline-block mt-1 text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded"
                                    >
                                        Maker
                                    </span>
                                {/if}
                            </div>
                        </div>
                    </a>
                {/each}
            {/if}
        </div>
    </div>
</div>
