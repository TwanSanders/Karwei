<script lang="ts">
    export let onRegister: (data: {
        name: string;
        email: string;
        phoneNumber: string;
        password: string;
    }) => void;

    let name = "";
    let email = "";
    let phoneNumber = "";
    let password = "";
    let confirmPassword = "";
    let error = "";
    let isSubmitting = false;
    let showPassword = false;
    let showConfirmPassword = false;

    export function submit() {
        handleSubmit();
    }

    function handleSubmit() {
        error = "";

        if (!name || !email || !phoneNumber || !password) {
            error = "All fields are required";
            return;
        }

        if (password !== confirmPassword) {
            error = "Passwords do not match";
            return;
        }

        if (password.length < 6) {
            error = "Password must be at least 6 characters";
            return;
        }

        isSubmitting = true;
        onRegister({ name, email, phoneNumber, password });
    }
</script>

<div class="space-y-6">
    <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Create your account
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
            Just a few more details to publish your request
        </p>
    </div>

    {#if error}
        <div
            class="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4"
        >
            <p class="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
    {/if}

    <div class="space-y-4">
        <div>
            <label
                for="name"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
                Full Name
            </label>
            <input
                id="name"
                type="text"
                bind:value={name}
                disabled={isSubmitting}
                class="w-full px-4 py-2 text-base sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="John Doe"
            />
        </div>

        <div>
            <label
                for="email"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
                Email
            </label>
            <input
                id="email"
                type="email"
                bind:value={email}
                disabled={isSubmitting}
                class="w-full px-4 py-2 text-base sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="john@example.com"
            />
        </div>

        <div>
            <label
                for="phone"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
                Phone Number
            </label>
            <input
                id="phone"
                type="tel"
                bind:value={phoneNumber}
                disabled={isSubmitting}
                class="w-full px-4 py-2 text-base sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="+32 123 456 789"
            />
        </div>

        <div>
            <label
                for="password"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
                Password
            </label>
            <div class="relative">
                <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    bind:value={password}
                    disabled={isSubmitting}
                    class="w-full px-4 py-2 pr-10 text-base sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="••••••••"
                />
                <button
                    type="button"
                    on:mousedown={() => (showPassword = true)}
                    on:mouseup={() => (showPassword = false)}
                    on:mouseleave={() => (showPassword = false)}
                    on:touchstart={(e) => {
                        e.preventDefault();
                        showPassword = true;
                    }}
                    on:touchend={() => (showPassword = false)}
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
                >
                    {#if showPassword}
                        <svg
                            class="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                        </svg>
                    {:else}
                        <svg
                            class="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                        </svg>
                    {/if}
                </button>
            </div>
        </div>

        <div>
            <label
                for="confirmPassword"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
                Confirm Password
            </label>
            <div class="relative">
                <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    bind:value={confirmPassword}
                    disabled={isSubmitting}
                    class="w-full px-4 py-2 pr-10 text-base sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="••••••••"
                />
                <button
                    type="button"
                    on:mousedown={() => (showConfirmPassword = true)}
                    on:mouseup={() => (showConfirmPassword = false)}
                    on:mouseleave={() => (showConfirmPassword = false)}
                    on:touchstart={(e) => {
                        e.preventDefault();
                        showConfirmPassword = true;
                    }}
                    on:touchend={() => (showConfirmPassword = false)}
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
                >
                    {#if showConfirmPassword}
                        <svg
                            class="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                        </svg>
                    {:else}
                        <svg
                            class="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                        </svg>
                    {/if}
                </button>
            </div>
        </div>
    </div>

    <div
        class="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
    >
        <p class="text-sm text-blue-800 dark:text-blue-200">
            💡 Already have an account? <a
                href="/login"
                class="font-medium underline hover:no-underline"
                >Log in instead</a
            >
        </p>
    </div>
</div>
