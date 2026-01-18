import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		// "true" allows any host (perfect for dynamic tunnel URLs)
		allowedHosts: true
	}
});
