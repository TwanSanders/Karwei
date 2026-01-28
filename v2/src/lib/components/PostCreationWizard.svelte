<script lang="ts">
    import { fade, slide } from "svelte/transition";
    import { onMount, tick } from "svelte";
    import WizardProgressBar from "./wizard/WizardProgressBar.svelte";
    import WizardStep1Category from "./wizard/WizardStep1Category.svelte";
    import WizardStep2Task from "./wizard/WizardStep2Task.svelte";
    import WizardStep3Media from "./wizard/WizardStep3Media.svelte";
    import WizardStep4Location from "./wizard/WizardStep4Location.svelte";
    import WizardStep5Review from "./wizard/WizardStep5Review.svelte";
    import WizardStep6Register from "./wizard/WizardStep6Register.svelte";
    import type { Skill } from "$lib/domain/types";

    export let availableSkills: Skill[];
    export let user: App.Locals["user"] | null = null;

    let currentStep = 1;
    let formElement: HTMLFormElement;
    let hiddenFileInput: HTMLInputElement;
    let isLoaded = false;
    let registerStepRef: any;
    let isAutoSubmitting = false;
    let isFromAI = false;

    // Form data state
    let formData = {
        category: "",
        title: "",
        description: "",
        price: "",
        imageFile: null as File | null,
        imagePreviewUrl: null as string | null,
        lat: null as number | null,
        long: null as number | null,
    };

    // Load draft on mount
    onMount(async () => {
        const draft = localStorage.getItem("karwei_post_draft");
        const shouldAutoSubmit = localStorage.getItem("karwei_auto_submit");
        const isAIDraft = localStorage.getItem("karwei_ai_draft_source");

        if (draft) {
            try {
                const data = JSON.parse(draft);
                // Basic restore
                formData.category = data.category || "";

                // If AI draft, map category string to ID if needed (or assume direct match for now)
                // In a real app we'd need fuzzy matching if AI output isn't perfect ID

                formData.title = data.title || "";
                formData.description = data.description || "";
                formData.price = data.price || "";
                formData.lat = data.lat || null;
                formData.long = data.long || null;

                // If it's an AI draft, we can skip Step 1 (Category) if category is present
                // and maybe Step 2 if title/desc are present, but user should review.
                // Let's jump to Step 2 so they can review the text.
                if (isAIDraft && formData.category) {
                    // Clear the AI flag so it doesn't jump every time
                    localStorage.removeItem("karwei_ai_draft_source");
                    isFromAI = true; // Track that this came from AI
                    currentStep = 2; // Jump to details
                }

                // Restore image if exists
                if (data.imagePreviewUrl) {
                    formData.imagePreviewUrl = data.imagePreviewUrl;

                    // Convert base64 back to file for submission
                    try {
                        const res = await fetch(data.imagePreviewUrl);
                        const blob = await res.blob();
                        const file = new File([blob], "recovered_image.jpg", {
                            type: blob.type,
                        });
                        formData.imageFile = file;

                        // Sync with hidden input
                        await tick();
                        if (hiddenFileInput) {
                            const dt = new DataTransfer();
                            dt.items.add(file);
                            hiddenFileInput.files = dt.files;
                        }
                    } catch (err) {
                        console.error("Failed to restore image file", err);
                    }
                }

                // If user just logged in and we have a ready draft, jump to review
                if (user && canProceedToReview()) {
                    currentStep = 5;

                    // Auto-submit if flag is set (coming back from registration)
                    if (shouldAutoSubmit) {
                        isAutoSubmitting = true;
                        localStorage.removeItem("karwei_auto_submit");

                        // Wait for form to be fully ready
                        setTimeout(async () => {
                            await tick();

                            // Double check form element exists
                            if (formElement) {
                                // Clear draft and submit
                                localStorage.removeItem("karwei_post_draft");
                                formElement.submit();
                            } else {
                                isAutoSubmitting = false;
                                console.error(
                                    "Form element not found for auto-submit",
                                );
                            }
                        }, 800); // 800ms delay to ensure hydration and UI feedback
                    }
                }
            } catch (e) {
                console.error("Failed to parse draft", e);
                isAutoSubmitting = false;
            }
        }
        isLoaded = true;
    });

    // Save draft whenever data changes
    $: {
        if (isLoaded && typeof localStorage !== "undefined") {
            const draftData = {
                category: formData.category,
                title: formData.title,
                description: formData.description,
                price: formData.price,
                lat: formData.lat,
                long: formData.long,
                // Only save preview URL for image, not the File object
                imagePreviewUrl: formData.imagePreviewUrl,
            };
            localStorage.setItem(
                "karwei_post_draft",
                JSON.stringify(draftData),
            );
        }
    }

    function canProceedToReview() {
        return (
            formData.category &&
            formData.title &&
            formData.description &&
            formData.lat &&
            formData.long
        );
    }

    // Validation functions for each step
    function isStep1Valid(): boolean {
        return formData.category !== "";
    }

    function isStep2Valid(): boolean {
        return (
            formData.title.trim() !== "" && formData.description.trim() !== ""
        );
    }

    function isStep3Valid(): boolean {
        return true; // Image is optional
    }

    function isStep4Valid(): boolean {
        return formData.lat !== null && formData.long !== null;
    }

    // Reactive validation - updates whenever formData or currentStep changes
    $: isValid = (() => {
        // We reference formData properties directly here so Svelte tracks the dependency
        switch (currentStep) {
            case 1:
                return formData.category !== "";
            case 2:
                return (
                    formData.title.trim() !== "" &&
                    formData.description.trim() !== ""
                );
            case 3:
                return true; // Image is optional
            case 4:
                return formData.lat !== null && formData.long !== null;
            case 5:
                return true; // Review step
            case 6:
                return true; // Registration step
            default:
                return false;
        }
    })();

    $: maxStep = user ? 5 : 6;

    function nextStep() {
        if (isValid && currentStep < maxStep) {
            currentStep++;
            scrollToTop();
        }
    }

    function prevStep() {
        if (currentStep > 1) {
            currentStep--;
            scrollToTop();
        }
    }

    function goToStep(step: number) {
        currentStep = step;
        scrollToTop();
    }

    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Handlers for step components
    function handleCategorySelect(category: string) {
        formData = { ...formData, category };
    }

    function handleTaskChange(field: string, value: string) {
        if (field === "title") formData.title = value;
        if (field === "description") formData.description = value;
        if (field === "price") formData.price = value;
    }

    function handleFileSelect(file: File | null) {
        formData.imageFile = file;
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                formData.imagePreviewUrl = e.target?.result as string;
            };
            reader.readAsDataURL(file);

            // Update hidden file input
            if (hiddenFileInput) {
                const dt = new DataTransfer();
                dt.items.add(file);
                hiddenFileInput.files = dt.files;
            }
        } else {
            formData.imagePreviewUrl = null;
            // Clear hidden file input
            if (hiddenFileInput) {
                hiddenFileInput.value = "";
            }
        }
    }

    function handleLocationChange(lat: number | null, long: number | null) {
        formData.lat = lat;
        formData.long = long;
    }

    async function handleRegister(data: {
        name: string;
        email: string;
        phoneNumber: string;
        password: string;
    }) {
        try {
            isAutoSubmitting = true;

            const regFormData = new FormData();
            regFormData.append("name", data.name);
            regFormData.append("email", data.email);
            regFormData.append("phoneNumber", data.phoneNumber);
            regFormData.append("password", data.password);
            regFormData.append("confirmPassword", data.password);

            const res = await fetch("/register", {
                method: "POST",
                body: regFormData,
            });

            if (res.ok) {
                // Registration successful - session cookie is now set
                // Submit the post form directly (no page reload needed!)
                localStorage.removeItem("karwei_post_draft");
                localStorage.removeItem("karwei_auto_submit");

                // Small delay to ensure session is established
                await new Promise((r) => setTimeout(r, 300));

                // Submit the form
                formElement.submit();
            } else {
                isAutoSubmitting = false;
                alert("Registration failed. Please try again.");
            }
        } catch (err) {
            console.error("Registration error:", err);
            isAutoSubmitting = false;
            alert("An error occurred during registration.");
        }
    }

    function handleSubmit() {
        if (!user && currentStep === 5) {
            // Not logged in, go to registration step
            currentStep = 6;
            scrollToTop();
            return;
        }

        if (currentStep === maxStep) {
            // Clear draft on successful submission
            localStorage.removeItem("karwei_post_draft");
            formElement.submit();
        }
    }
</script>

<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
    {#if isAutoSubmitting}
        <div
            class="absolute inset-0 bg-white/80 dark:bg-gray-900/80 z-50 flex items-center justify-center rounded-lg backdrop-blur-sm"
        >
            <div class="flex flex-col items-center">
                <div
                    class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"
                ></div>
                <p class="text-lg font-medium text-gray-900 dark:text-white">
                    Publishing your post...
                </p>
            </div>
        </div>
    {/if}
    <WizardProgressBar {currentStep} />

    <form
        bind:this={formElement}
        method="POST"
        action="?/create"
        enctype="multipart/form-data"
        class="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
        <!-- Hidden inputs for form submission -->
        <input type="hidden" name="type" value={formData.category} />
        <input type="hidden" name="title" value={formData.title} />
        <input type="hidden" name="description" value={formData.description} />
        <input type="hidden" name="price" value={formData.price} />
        <input type="hidden" name="lat" value={formData.lat ?? ""} />
        <input type="hidden" name="long" value={formData.long ?? ""} />

        <!-- Image file input (hidden) -->
        <input
            type="file"
            name="image"
            bind:this={hiddenFileInput}
            class="sr-only"
            accept="image/*"
            tabindex="-1"
        />

        <!-- Step Content -->
        <div class="px-6 py-8 min-h-[500px]">
            {#if currentStep === 1}
                <div in:fade={{ duration: 200 }}>
                    <WizardStep1Category
                        {availableSkills}
                        bind:selectedCategory={formData.category}
                        onSelect={handleCategorySelect}
                    />
                </div>
            {:else if currentStep === 2}
                <div in:fade={{ duration: 200 }}>
                    <WizardStep2Task
                        title={formData.title}
                        description={formData.description}
                        price={formData.price}
                        onChange={handleTaskChange}
                        {isFromAI}
                    />
                </div>
            {:else if currentStep === 3}
                <div in:fade={{ duration: 200 }}>
                    <WizardStep3Media
                        imageFile={formData.imageFile}
                        imagePreviewUrl={formData.imagePreviewUrl}
                        onFileSelect={handleFileSelect}
                    />
                </div>
            {:else if currentStep === 4}
                <div in:fade={{ duration: 200 }}>
                    <WizardStep4Location
                        bind:lat={formData.lat}
                        bind:long={formData.long}
                        onChange={handleLocationChange}
                    />
                </div>
            {:else if currentStep === 5}
                <div in:fade={{ duration: 200 }}>
                    <div in:fade={{ duration: 200 }}>
                        <WizardStep5Review
                            {formData}
                            {availableSkills}
                            onEdit={goToStep}
                        />
                    </div>
                </div>
            {:else if currentStep === 6}
                <div in:fade={{ duration: 200 }}>
                    <WizardStep6Register
                        bind:this={registerStepRef}
                        onRegister={handleRegister}
                    />
                </div>
            {/if}
        </div>

        <!-- Navigation Buttons -->
        <div
            class="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600 flex justify-between"
        >
            <button
                type="button"
                on:click={prevStep}
                disabled={currentStep === 1}
                class="inline-flex items-center px-4 py-2.5 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-lg
                    {currentStep === 1
                    ? 'text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 cursor-not-allowed'
                    : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'}
                    transition-colors"
            >
                <svg
                    class="w-5 h-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 19l-7-7 7-7"
                    />
                </svg>
                Back
            </button>

            {#if currentStep < maxStep}
                <button
                    type="button"
                    on:click={nextStep}
                    disabled={!isValid}
                    class="inline-flex items-center px-6 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white
                        {isValid
                        ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'
                        : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'}
                        transition-colors"
                >
                    Next
                    <svg
                        class="w-5 h-5 ml-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                </button>
            {:else if currentStep === 5 && !user}
                <button
                    type="button"
                    on:click={handleSubmit}
                    class="inline-flex items-center px-6 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors"
                >
                    Continue to Register
                    <svg
                        class="w-5 h-5 ml-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                </button>
            {:else if currentStep === 6}
                <button
                    type="button"
                    on:click={() => registerStepRef?.submit()}
                    class="inline-flex items-center px-6 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 transition-colors"
                >
                    <svg
                        class="w-5 h-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                        />
                    </svg>
                    Create Account & Post
                </button>
            {:else}
                <button
                    type="button"
                    on:click={handleSubmit}
                    class="inline-flex items-center px-6 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 transition-colors"
                >
                    <svg
                        class="w-5 h-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                    Confirm & Post
                </button>
            {/if}
        </div>
    </form>
</div>
