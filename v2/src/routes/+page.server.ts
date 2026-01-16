import type { PageServerLoad } from './$types';
import { PostRepository } from '$lib/server/repositories/postRepository';

export const load: PageServerLoad = async () => {
    const posts = await PostRepository.getAll();
    return {
        posts
    };
};
