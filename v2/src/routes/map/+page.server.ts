
import { PostRepository } from '$lib/server/repositories/postRepository';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    try {
        const posts = await PostRepository.findAllOpenWithLocation();
        return {
            posts
        };
    } catch (error) {
        console.error("Map Load Error:", error);
        return {
            posts: []
        };
    }
};
