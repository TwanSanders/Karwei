<script lang="ts">
    import { onMount, afterUpdate } from "svelte";
    import { marked } from "marked";
    import { goto } from "$app/navigation";
    import { fade, slide } from "svelte/transition";

    let messages: { role: "user" | "assistant"; content: string }[] = [];
    let newMessage = "";
    let isLoading = false;
    let chatContainer: HTMLElement;
    let draftData: {
        title?: string;
        description?: string;
        category?: string;
        price?: string;
    } | null = null;
    let isDraftReady = false;

    onMount(() => {
        // Initial greeting
        messages = [
            {
                role: "assistant",
                content:
                    "Hi! I'm here to help you create your repair post. Briefly describe what needs fixing, and I'll ask a few questions to get the details right.",
            },
        ];
    });

    afterUpdate(() => {
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    });

    async function sendMessage() {
        if (!newMessage.trim() || isLoading) return;

        const userMsg = { role: "user" as const, content: newMessage };
        messages = [...messages, userMsg];
        const payloadMsg = newMessage;
        newMessage = "";
        isLoading = true;

        try {
            const res = await fetch("/api/ai-draft", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: payloadMsg,
                    history: messages.slice(0, -1), // Send history excluding current user msg (server can append it)
                }),
            });

            if (res.ok) {
                const data = await res.json();

                // Add assistant response
                messages = [
                    ...messages,
                    { role: "assistant", content: data.reply },
                ];

                // Check if AI generated a draft
                if (data.draft) {
                    draftData = data.draft;
                    isDraftReady = true;
                }
            } else {
                throw new Error("Failed to fetch response");
            }
        } catch (e) {
            console.error(e);
            messages = [
                ...messages,
                {
                    role: "assistant",
                    content:
                        "Sorry, I'm having trouble connecting right now. Please try again or create your post manually.",
                },
            ];
        } finally {
            isLoading = false;
        }
    }

    function createPost() {
        if (draftData) {
            // Save to localStorage
            const draft = {
                category: draftData.category || "",
                title: draftData.title || "",
                description: draftData.description || "",
                price: draftData.price || "",
                lat: null,
                long: null,
            };
            localStorage.setItem("karwei_post_draft", JSON.stringify(draft));
            localStorage.setItem("karwei_ai_draft_source", "true"); // Flag to show "AI Draft" badge maybe?

            goto("/post/create");
        }
    }

    function skipToManual() {
        goto("/post/create");
    }
</script>

<!-- Fixed Header -->
<header
    class="fixed top-14 left-0 right-0 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-4 z-40"
>
    <div class="max-w-3xl mx-auto flex justify-between items-center">
        <h1
            class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"
        >
            <span class="text-2xl">🤖</span> AI Repair Assistant
        </h1>
        <button
            on:click={skipToManual}
            class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
            Skip to manual form
        </button>
    </div>
</header>

<!-- Scrollable Chat Area (sits between fixed header and footer) -->
<main
    class="fixed top-28 bottom-24 left-0 right-0 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4"
    bind:this={chatContainer}
>
    <div class="max-w-3xl mx-auto space-y-4">
        {#each messages as msg}
            <div
                class="flex {msg.role === 'user'
                    ? 'justify-end'
                    : 'justify-start'}"
            >
                <div
                    class="max-w-[85%] rounded-2xl px-4 py-3 shadow-sm
                        {msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-gray-700'}"
                >
                    <div class="prose prose-sm dark:prose-invert max-w-none">
                        {@html marked.parse(msg.content)}
                    </div>
                </div>
            </div>
        {/each}

        {#if isLoading}
            <div class="flex justify-start">
                <div
                    class="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-gray-100 dark:border-gray-700"
                >
                    <div class="flex gap-1">
                        <div
                            class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        ></div>
                        <div
                            class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"
                        ></div>
                        <div
                            class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"
                        ></div>
                    </div>
                </div>
            </div>
        {/if}

        {#if isDraftReady}
            <div in:slide class="flex justify-center py-4">
                <div
                    class="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-xl p-6 max-w-md w-full shadow-lg"
                >
                    <h3
                        class="text-lg font-semibold text-indigo-900 dark:text-indigo-200 mb-2"
                    >
                        Draft Ready!
                    </h3>
                    <p
                        class="text-sm text-indigo-800 dark:text-indigo-300 mb-4"
                    >
                        I've prepared a post for you based on our conversation.
                    </p>

                    <div
                        class="bg-white dark:bg-gray-800 rounded p-3 mb-4 text-sm border border-indigo-100 dark:border-indigo-900/50"
                    >
                        <p class="font-bold text-gray-900 dark:text-white mb-1">
                            {draftData?.title}
                        </p>
                        <p
                            class="text-gray-600 dark:text-gray-400 line-clamp-2"
                        >
                            {draftData?.description}
                        </p>
                    </div>

                    <button
                        on:click={createPost}
                        class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <span>Continue to Post Wizard</span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fill-rule="evenodd"
                                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                                clip-rule="evenodd"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        {/if}
    </div>
</main>

<!-- Input Area -->
<footer
    class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 z-50"
>
    <div class="max-w-3xl mx-auto">
        <form on:submit|preventDefault={sendMessage} class="flex gap-2">
            <input
                type="text"
                bind:value={newMessage}
                placeholder="Type your reply..."
                class="flex-1 rounded-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2"
                disabled={isLoading || isDraftReady}
            />
            <button
                type="submit"
                disabled={isLoading || !newMessage.trim() || isDraftReady}
                class="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
        <p class="text-xs text-center text-gray-400 mt-2">
            AI can make mistakes. Review the draft before posting.
        </p>
    </div>
</footer>
