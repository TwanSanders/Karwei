import { browser } from '$app/environment';
import { writable } from 'svelte/store';

// 1. Determine initial value (Storage -> System Preference -> Default Light)
const defaultValue = 'light';
const initialValue = browser 
    ? window.localStorage.getItem('theme') ?? 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : defaultValue)
    : defaultValue;

export const theme = writable(initialValue);

// 2. Subscribe to changes to update the DOM and Storage
theme.subscribe((value) => {
    if (browser) {
        window.localStorage.setItem('theme', value);
        // This is the actual switch:
        document.documentElement.classList.toggle('dark', value === 'dark');
    }
});
