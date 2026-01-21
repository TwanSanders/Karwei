<script lang="ts">
    import type { PageData } from "./$types";
    import SmartChatHeader from "$lib/components/SmartChatHeader.svelte";
    import MessageStream from "$lib/components/MessageStream.svelte";
    import ChatInput from "$lib/components/ChatInput.svelte";
    import { ChevronLeft } from "lucide-svelte";

    let { data }: { data: PageData } = $props();
</script>

<svelte:head>
    <title>Chat with {data.partner.name} | Karwei</title>
</svelte:head>

<div class="h-[calc(100dvh-64px)] flex flex-col bg-white dark:bg-gray-900">
    <!-- Mobile Back Button -->
    <div
        class="md:hidden flex items-center gap-2 p-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0"
    >
        <a
            href="/chat"
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
            <ChevronLeft class="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </a>
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300"
            >Back to Chats</span
        >
    </div>

    <!-- Smart Header (max 15% on mobile) -->
    <div style="max-height: 15vh;" class="flex-shrink-0">
        <SmartChatHeader partner={data.partner} activeJobs={data.activeJobs} />
    </div>

    <!-- Message Stream (flexible height, scrollable) -->
    <div class="flex-1 min-h-0">
        <MessageStream
            messages={data.messages}
            currentUserId={data.currentUser?.id || ""}
        />
    </div>

    <!-- Chat Input (sticky at bottom) -->
    <div
        class="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-900"
    >
        <ChatInput conversationId={data.conversationId} />
    </div>
</div>
