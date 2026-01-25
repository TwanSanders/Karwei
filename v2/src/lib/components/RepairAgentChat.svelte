<script lang="ts">
    import { onMount, afterUpdate } from "svelte";
    import { marked } from "marked";

    export let post: any;

    let conversations: any[] = [];
    let activeChatId: string | null = null;
    let messages: { role: "user" | "assistant"; content: string }[] = [];
    let newMessage = "";
    let isLoading = false;
    let chatContainer: HTMLElement;
    let isOpen = false;

    onMount(async () => {
        await loadConversations();
    });

    async function loadConversations() {
        try {
            const res = await fetch(`/api/repair-agent?postId=${post.id}`);
            if (res.ok) {
                const data = await res.json();
                conversations = data.conversations || [];
                if (conversations.length > 0 && !activeChatId) {
                    selectChat(conversations[0].id);
                }
            }
        } catch (e) {
            console.error("Failed to load conversations", e);
        }
    }

    async function selectChat(chatId: string) {
        activeChatId = chatId;
        isLoading = true;
        try {
            const res = await fetch(`/api/repair-agent?chatId=${chatId}`);
            if (res.ok) {
                const data = await res.json();
                messages = data.messages.map((m: any) => ({
                    role: m.role === "model" ? "assistant" : m.role,
                    content: m.content,
                }));
            }
        } catch (e) {
            console.error(e);
        } finally {
            isLoading = false;
        }
    }

    function createNewChat() {
        activeChatId = null;
        messages = [];
    }

    async function deleteChat(chatId: string, event: Event) {
        event.stopPropagation();

        if (!confirm("Are you sure you want to delete this chat?")) {
            return;
        }

        try {
            const res = await fetch(`/api/repair-agent?chatId=${chatId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                console.log("[Frontend] Deleted chat:", chatId);
                // If we deleted the active chat, clear it
                if (activeChatId === chatId) {
                    activeChatId = null;
                    messages = [];
                }
                // Reload the list
                await loadConversations();
            } else {
                alert("Failed to delete chat");
            }
        } catch (e) {
            console.error("Delete failed:", e);
            alert("Error deleting chat");
        }
    }

    function cleanAIResponse(text: string): string {
        // Remove internal tool logging and thoughts exposed by Gemini
        let cleaned = text;

        // Remove tool_code blocks
        cleaned = cleaned.replace(/tool_code[\s\S]*?(?=thought)/g, "");

        // Remove thought blocks (usually terminate with a double newline or when actual response starts)
        // We match "thought" followed by content until a double newline or end of string
        cleaned = cleaned.replace(/thought[\s\S]*?(\n\n|$)/g, "");

        return cleaned.trim();
    }

    async function sendMessage() {
        if (!newMessage.trim()) return;

        console.log("[Frontend] Sending message with chatId:", activeChatId);
        const userMsg = { role: "user" as const, content: newMessage };
        messages = [...messages, userMsg];
        const payloadMsg = newMessage;
        newMessage = "";
        isLoading = true;

        messages = [...messages, { role: "assistant", content: "" }];
        let assistantMsgIndex = messages.length - 1;

        try {
            const response = await fetch("/api/repair-agent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: payloadMsg,
                    postContext: post,
                    chatId: activeChatId,
                }),
            });

            if (!response.ok) throw new Error("Failed to fetch");

            const newId = response.headers.get("X-Conversation-Id");
            if (newId && !activeChatId) {
                console.log("[Frontend] Captured new conversation ID:", newId);
                activeChatId = newId;
                // Don't reload immediately - let the title generate first
            } else if (newId) {
                console.log(
                    "[Frontend] Conversation ID from server:",
                    newId,
                    "Active:",
                    activeChatId,
                );
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) throw new Error("No reader");

            let fullText = "";
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                fullText += chunk;

                messages[assistantMsgIndex].content = cleanAIResponse(fullText);
                messages = messages;
            }
        } catch (e: any) {
            console.error(e);

            // Check if it's a quota error
            let errorMsg = "Sorry, connection error. Please try again.";

            if (e.message && e.message.includes("quota")) {
                errorMsg =
                    "⚠️ **API Quota Reached**\n\nThe AI assistant has reached its daily limit (20 requests/day on the free tier). Please try again in 24 hours, or upgrade to a paid plan for higher limits.\n\n[Learn more about quotas](https://ai.google.dev/gemini-api/docs/rate-limits)";
            } else if (e.message && e.message.includes("429")) {
                errorMsg =
                    "⚠️ **Rate Limit Exceeded**\n\nToo many requests. Please wait a moment and try again.";
            }

            messages[assistantMsgIndex].content = errorMsg;
        } finally {
            isLoading = false;
        }
    }

    afterUpdate(() => {
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    });

    // Configure marked for clickable links
    const renderer = new marked.Renderer();
    renderer.link = function (token: any): string {
        const href = token.href || "";
        const title = token.title || "";
        const text = token.text || href;
        return `<a href="${href}" title="${title}" target="_blank" rel="noopener noreferrer" class="text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-800 dark:hover:text-indigo-300">${text}</a>`;
    };
    marked.use({ renderer });

    function renderMarkdown(text: string) {
        return marked.parse(text, { breaks: true });
    }
</script>

<div
    class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
>
    <!-- Header -->
    <button
        class="w-full bg-indigo-600 px-4 py-3 flex justify-between items-center hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        on:click={() => (isOpen = !isOpen)}
        aria-expanded={isOpen}
        type="button"
    >
        <div class="flex items-center gap-2">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-indigo-100"
                viewBox="0 0 20 20"
                fill="currentColor"
            >
                <path
                    fill-rule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                />
            </svg>
            <h3 class="text-sm font-medium text-white">AI Repair Assistant</h3>
        </div>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-white transform transition-transform {isOpen
                ? 'rotate-180'
                : ''}"
            viewBox="0 0 20 20"
            fill="currentColor"
        >
            <path
                fill-rule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clip-rule="evenodd"
            />
        </svg>
    </button>

    {#if isOpen}
        <div class="border-t border-gray-200 dark:border-gray-700">
            <!-- Chat Selector Bar -->
            {#if conversations.length > 0}
                <div
                    class="bg-gray-50 dark:bg-gray-900 px-3 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2"
                >
                    <select
                        bind:value={activeChatId}
                        on:change={(e) => {
                            const target = e.target as HTMLSelectElement;
                            if (target.value) {
                                selectChat(target.value);
                            }
                        }}
                        on:focus={() => loadConversations()}
                        class="flex-1 text-sm px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="" disabled>Select a chat...</option>
                        {#each conversations as chat}
                            <option value={chat.id}>
                                {chat.title}
                            </option>
                        {/each}
                    </select>
                    <button
                        type="button"
                        on:click={createNewChat}
                        class="px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-colors"
                        title="New chat"
                    >
                        New
                    </button>
                    {#if activeChatId}
                        <button
                            type="button"
                            on:click={(e) => deleteChat(activeChatId, e)}
                            class="px-2 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Delete current chat"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fill-rule="evenodd"
                                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                        </button>
                    {/if}
                </div>
            {/if}

            <!-- Messages -->
            <div
                bind:this={chatContainer}
                class="h-96 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900/50"
            >
                {#if messages.length === 0}
                    <div
                        class="text-center py-8 text-gray-500 dark:text-gray-400 text-sm"
                    >
                        <p>Ask me anything about diagnosing or repairing</p>
                        <p class="font-semibold mt-1">{post.title}</p>
                    </div>
                {/if}

                {#each messages as msg}
                    <div
                        class="flex {msg.role === 'user'
                            ? 'justify-end'
                            : 'justify-start'}"
                    >
                        <div
                            class="max-w-[85%] rounded-lg px-3 py-2 text-sm {msg.role ===
                            'user'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'}"
                        >
                            {#if msg.role === "assistant"}
                                <div
                                    class="prose prose-sm dark:prose-invert max-w-none [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:ml-4 [&_ul]:my-1 [&_li]:mb-1"
                                >
                                    {@html renderMarkdown(msg.content)}
                                </div>
                            {:else}
                                {msg.content}
                            {/if}
                        </div>
                    </div>
                {/each}

                {#if isLoading && messages[messages.length - 1]?.role !== "assistant"}
                    <div class="flex justify-start">
                        <div
                            class="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow-sm text-sm text-gray-500 animate-pulse"
                        >
                            Thinking...
                        </div>
                    </div>
                {/if}
            </div>

            <!-- Input -->
            <div
                class="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
            >
                <form on:submit|preventDefault={sendMessage} class="flex gap-2">
                    <input
                        type="text"
                        bind:value={newMessage}
                        placeholder="Ask about tools, diagnosis..."
                        class="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !newMessage.trim()}
                        class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Send message"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"
                            />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    {/if}
</div>
