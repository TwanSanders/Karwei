<script>
	import "../app.css";
	import Navbar from "$lib/components/Navbar.svelte";
</script>

<div class="min-h-screen bg-gray-50">
	<Navbar />
	<main>
		<slot />
	</main>
</div>
