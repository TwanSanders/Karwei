
import { PostRepository } from '$lib/server/repositories/postRepository';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const posts = await PostRepository.findAllOpenWithLocation();
    
    return {
        posts
    };
};
