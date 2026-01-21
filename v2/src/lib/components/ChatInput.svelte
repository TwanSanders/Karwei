<script lang="ts">
    import { Send, Image, X } from "lucide-svelte";
    import { enhance } from "$app/forms";

    let {
        conversationId,
        initialMessage = "",
    }: { conversationId: string; initialMessage?: string } = $props();

    let messageContent = $state(initialMessage);
    let textarea: HTMLTextAreaElement;
    let fileInput: HTMLInputElement;
    let isSubmitting = $state(false);
    let selectedFile: File | null = $state(null);
    let previewUrl: string | null = $state(null);

    function handleInput() {
        // Auto-resize textarea
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = textarea.scrollHeight + "px";
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        // Submit on Enter (but not Shift+Enter for new lines)
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            const form = textarea.closest("form");
            // Allow submit if there is text OR a file
            if (form && (messageContent.trim() || selectedFile)) {
                form.requestSubmit();
            }
        }
    }

    function handleFileSelect(e: Event) {
        const input = e.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];
            // 5MB limit
            if (file.size > 5 * 1024 * 1024) {
                alert("File is too large. Maximum size is 5MB.");
                input.value = "";
                selectedFile = null;
                return;
            }
            selectedFile = file;
            previewUrl = URL.createObjectURL(selectedFile);
        }
    }

    function removeFile() {
        selectedFile = null;
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            previewUrl = null;
        }
        if (fileInput) {
            fileInput.value = "";
        }
    }
</script>

<div
    class="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
>
    <!-- Image Preview -->
    {#if previewUrl}
        <div class="px-4 pt-4 pb-2 flex gap-2 overflow-x-auto">
            <div class="relative inline-block">
                <img
                    src={previewUrl}
                    alt="Preview"
                    class="h-24 w-auto rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                />
                <button
                    type="button"
                    onclick={removeFile}
                    class="absolute -top-2 -right-2 bg-gray-900 text-white rounded-full p-1 hover:bg-gray-700 transition-colors shadow-sm"
                    aria-label="Remove image"
                >
                    <X class="w-3 h-3" />
                </button>
            </div>
        </div>
    {/if}

    <div class="p-4">
        <form
            method="POST"
            action="?/sendMessage"
            enctype="multipart/form-data"
            use:enhance={() => {
                isSubmitting = true;
                return async ({ update }) => {
                    await update();
                    messageContent = "";
                    removeFile(); // Clear file after send
                    isSubmitting = false;
                    if (textarea) {
                        textarea.style.height = "auto";
                        textarea.focus();
                    }
                };
            }}
            class="flex items-end gap-2"
        >
            <input type="hidden" name="conversationId" value={conversationId} />

            <div class="flex-1">
                <textarea
                    bind:this={textarea}
                    bind:value={messageContent}
                    name="content"
                    placeholder={selectedFile
                        ? "Add a caption..."
                        : "Type a message..."}
                    rows="1"
                    oninput={handleInput}
                    onkeydown={handleKeydown}
                    disabled={isSubmitting}
                    class="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100
                           rounded-2xl border border-gray-300 dark:border-gray-600
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           resize-none max-h-32 disabled:opacity-50 transition-all font-sans text-base"
                    style="min-height: 42px;"
                ></textarea>
            </div>

            <!-- Image Upload Button -->
            <button
                type="button"
                onclick={() => fileInput?.click()}
                class={`flex-shrink-0 w-10 h-10 flex items-center justify-center transition-colors rounded-full
                        ${
                            selectedFile
                                ? "text-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        }`}
                style="min-height: 44px; min-width: 44px;"
                title="Attach image"
            >
                <Image class="w-5 h-5" />
            </button>
            <input
                bind:this={fileInput}
                type="file"
                name="image"
                accept="image/*"
                class="hidden"
                onchange={handleFileSelect}
            />

            <!-- Send Button -->
            <button
                type="submit"
                disabled={(!messageContent.trim() && !selectedFile) ||
                    isSubmitting}
                class="flex-shrink-0 w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300
                       dark:disabled:bg-gray-600 disabled:cursor-not-allowed
                       text-white rounded-full flex items-center justify-center transition-colors shadow-sm"
                style="min-height: 44px; min-width: 44px;"
            >
                <Send class="w-5 h-5" />
            </button>
        </form>
    </div>
</div>
