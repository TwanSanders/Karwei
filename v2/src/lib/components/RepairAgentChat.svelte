<script lang="ts">
    import { afterUpdate } from "svelte";

    export let post: any;

    let messages: { role: "user" | "assistant"; content: string }[] = [];
    let newMessage = "";
    let isLoading = false;
    let chatContainer: HTMLElement;
    let isOpen = false;

    // Simple markdown formatter
    function formatMarkdown(text: string): string {
        return text
            .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
            .replace(/\n\n/g, "<br><br>")
            .replace(/\n/g, "<br>")
            .replace(/^- (.+)$/gm, "<li>$1</li>")
            .replace(/(<li>.*?<\/li>(?:\s*<li>.*?<\/li>)*)/gs, "<ul>$1</ul>");
    }

    async function sendMessage() {
        if (!newMessage.trim()) return;

        const userMsg = { role: "user" as const, content: newMessage };
        messages = [...messages, userMsg];
        newMessage = "";
        isLoading = true;

        try {
            const response = await fetch("/api/repair-agent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: messages,
                    postContext: post,
                }),
            });

            if (!response.ok) throw new Error("Failed to fetch");

            const data = await response.json();
            messages = [
                ...messages,
                { role: "assistant", content: data.reply },
            ];
        } catch (e) {
            console.error(e);
            messages = [
                ...messages,
                {
                    role: "assistant",
                    content:
                        "Sorry, I'm having trouble connecting right now. Please try again.",
                },
            ];
        } finally {
            isLoading = false;
        }
    }

    afterUpdate(() => {
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    });
</script>

<div
    class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
>
    <div
        class="bg-indigo-600 px-4 py-3 flex justify-between items-center cursor-pointer"
        on:click={() => (isOpen = !isOpen)}
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
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0 1 1 0 002 0zm-1 4a1 1 0 00-1 1v4a1 1 0 102 0v-4a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                />
            </svg>
            <h3 class="text-sm font-medium text-white">
                Repair Assistant (AI)
            </h3>
        </div>
        <button class="text-indigo-200 hover:text-white">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 transform transition-transform {isOpen
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
    </div>

    {#if isOpen}
        <div class="p-4 h-80 flex flex-col">
            <!-- Chat Area -->
            <div
                bind:this={chatContainer}
                class="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
            >
                {#if messages.length === 0}
                    <div
                        class="text-center text-gray-500 dark:text-gray-400 text-sm mt-8"
                    >
                        <p>Hi! I'm your Repair Assistant.</p>
                        <p class="mt-1">
                            I can help you brainstorm issues with <strong
                                >{post.title}</strong
                            >.
                        </p>
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
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'}"
                        >
                            {#if msg.role === "assistant"}
                                <div
                                    class="prose-sm dark:prose-invert [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:ml-4 [&_ul]:mt-1 [&_li]:mb-1"
                                >
                                    {@html formatMarkdown(msg.content)}
                                </div>
                            {:else}
                                {msg.content}
                            {/if}
                        </div>
                    </div>
                {/each}

                {#if isLoading}
                    <div class="flex justify-start">
                        <div
                            class="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm text-gray-500 animate-pulse"
                        >
                            Thinking...
                        </div>
                    </div>
                {/if}
            </div>

            <!-- Input Area -->
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
                    class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
    {/if}
</div>
