<script>
	import "../app.css";
	import Navbar from "$lib/components/Navbar.svelte";
</script>

<div
	class="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-200"
>
	<Navbar />
	<main>
		<slot />
	</main>
</div>
