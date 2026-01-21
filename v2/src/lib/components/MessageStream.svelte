<script lang="ts">
    import { tick } from "svelte";
    import type { Message, User } from "$lib/domain/types";
    import { Handshake, ExternalLink } from "lucide-svelte";

    let {
        messages = [],
        currentUserId,
    }: {
        messages: (Message & { sender: User })[];
        currentUserId: string;
    } = $props();

    let messagesContainer: HTMLDivElement;
    let isNearBottom = true; // Default to true so initial load scrolls down
    let lastConversationId = "";

    // Auto-scroll to bottom when messages change (Svelte 5 runes mode)
    $effect(() => {
        // Access messages to track dependency
        messages;

        // Reset auto-scroll if conversation changes
        if (messages.length > 0) {
            const currentConvId = messages[0].conversationId;
            if (currentConvId !== lastConversationId) {
                isNearBottom = true;
                lastConversationId = currentConvId;
            }
        }

        // Scroll on next tick
        tick().then(() => {
            if (messagesContainer && isNearBottom) {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        });
    });

    function handleScroll() {
        if (!messagesContainer) return;
        const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
        // Check if user is near the bottom (within 100px)
        isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    }

    function isOwnMessage(senderId: string): boolean {
        return senderId === currentUserId;
    }

    function formatTime(date: Date): string {
        const d = new Date(date);
        return d.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    }
</script>

<div
    bind:this={messagesContainer}
    onscroll={handleScroll}
    class="h-full overflow-y-auto p-4 flex flex-col"
>
    {#if messages.length === 0}
        <div class="flex items-center justify-center h-full">
            <p class="text-gray-500 dark:text-gray-400 text-sm">
                No messages yet. Start the conversation!
            </p>
        </div>
    {:else}
        {#each messages as message, i (message.id)}
            {@const prevMessage = i > 0 ? messages[i - 1] : null}
            {@const nextMessage =
                i < messages.length - 1 ? messages[i + 1] : null}
            {@const isSequence =
                prevMessage &&
                prevMessage.senderId === message.senderId &&
                prevMessage.type !== "system_event" &&
                message.type !== "system_event" &&
                new Date(message.createdAt).getTime() -
                    new Date(prevMessage.createdAt).getTime() <
                    60000}
            {@const isNextInSequence =
                nextMessage &&
                nextMessage.senderId === message.senderId &&
                nextMessage.type !== "system_event" &&
                message.type !== "system_event" &&
                new Date(nextMessage.createdAt).getTime() -
                    new Date(message.createdAt).getTime() <
                    60000}

            <!-- Dynamic vertical spacing: small if sequence, normal otherwise -->
            <div class={isSequence ? "mt-1" : "mt-4"}>
                {#if message.type === "system_event"}
                    <!-- System Event Card -->
                    <div class="flex justify-center my-6">
                        <a
                            href="/post/{message.relatedEntityId}"
                            class="inline-flex items-center gap-3 px-6 py-4 bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-600 transition-all group max-w-md w-full"
                            style="min-height: 44px;"
                        >
                            <div
                                class="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center"
                            >
                                <Handshake
                                    class="w-5 h-5 text-blue-600 dark:text-blue-300"
                                />
                            </div>
                            <div class="flex-1 min-w-0">
                                <p
                                    class="text-sm font-medium text-gray-900 dark:text-gray-100"
                                >
                                    {message.content}
                                </p>
                                <p
                                    class="text-xs text-gray-500 dark:text-gray-400 mt-1"
                                >
                                    {formatTime(message.createdAt)}
                                </p>
                            </div>
                            <ExternalLink
                                class="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex-shrink-0"
                            />
                        </a>
                    </div>
                {:else}
                    <!-- User Message (Text or Image) -->
                    <div
                        class="flex {isOwnMessage(message.senderId)
                            ? 'justify-end'
                            : 'justify-start'}"
                    >
                        <div
                            class="flex items-end gap-2 max-w-[85%] md:max-w-[70%]"
                        >
                            {#if !isOwnMessage(message.senderId)}
                                <!-- Partner Avatar -->
                                {#if !isSequence}
                                    {#if message.sender.image}
                                        <img
                                            src={message.sender.image}
                                            alt={message.sender.name}
                                            class="w-8 h-8 rounded-full object-cover flex-shrink-0 mb-1"
                                        />
                                    {:else}
                                        <div
                                            class="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0 mb-1"
                                        ></div>
                                    {/if}
                                {:else}
                                    <!-- Invisible spacer for alignment in sequence -->
                                    <div class="w-8 h-8 flex-shrink-0"></div>
                                {/if}
                            {/if}

                            <div
                                class="flex flex-col {isOwnMessage(
                                    message.senderId,
                                )
                                    ? 'items-end'
                                    : 'items-start'}"
                            >
                                {#if message.type === "image"}
                                    <div
                                        class="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700"
                                    >
                                        <img
                                            src={message.content}
                                            alt="Shared image"
                                            class="max-w-full h-auto max-h-[400px] object-contain bg-black/5 dark:bg-black/20 block"
                                            loading="lazy"
                                        />
                                    </div>
                                {:else}
                                    <div
                                        class="px-4 py-2 rounded-2xl {isOwnMessage(
                                            message.senderId,
                                        )
                                            ? 'bg-blue-600 text-white ' +
                                              (isSequence
                                                  ? 'rounded-tr-sm'
                                                  : '') +
                                              (isNextInSequence
                                                  ? ' rounded-br-sm'
                                                  : '')
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 ' +
                                              (isSequence
                                                  ? 'rounded-tl-sm'
                                                  : '') +
                                              (isNextInSequence
                                                  ? ' rounded-bl-sm'
                                                  : '')}"
                                    >
                                        <p
                                            class="text-sm whitespace-pre-wrap break-words"
                                        >
                                            {message.content}
                                        </p>
                                    </div>
                                {/if}

                                <!-- Only show timestamp for last message in sequence -->
                                {#if !isNextInSequence}
                                    <span
                                        class="text-xs text-gray-500 dark:text-gray-400 mt-1 px-1"
                                    >
                                        {formatTime(message.createdAt)}
                                    </span>
                                {/if}
                            </div>

                            {#if isOwnMessage(message.senderId)}
                                <!-- Own Invisible Avatar Spacer -->
                                <div class="w-8 h-8 flex-shrink-0"></div>
                            {/if}
                        </div>
                    </div>
                {/if}
            </div>
        {/each}
    {/if}
</div>
