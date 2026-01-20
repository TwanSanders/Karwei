import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    // Redirect to home page - map functionality is now integrated there
    throw redirect(302, '/');
};
