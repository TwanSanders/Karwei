import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type ViewMode = 'poster' | 'maker';

function createViewModeStore() {
    const stored = browser ? localStorage.getItem('viewMode') : null;
    const initialValue: ViewMode = (stored as ViewMode) || 'poster';
    
    const { subscribe, set } = writable<ViewMode>(initialValue);
    
    return {
        subscribe,
        set: (value: ViewMode) => {
            if (browser) {
                localStorage.setItem('viewMode', value);
            }
            set(value);
        },
        reset: () => {
            if (browser) {
                localStorage.removeItem('viewMode');
            }
            set('poster');
        }
    };
}

export const viewMode = createViewModeStore();
