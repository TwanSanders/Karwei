import type { PageServerLoad } from './$types';
import { PostRepository } from '$lib/server/repositories/postRepository';

export const load: PageServerLoad = async ({ url }) => {
    const lat = url.searchParams.get('lat') ? parseFloat(url.searchParams.get('lat')!) : undefined;
    const long = url.searchParams.get('long') ? parseFloat(url.searchParams.get('long')!) : undefined;
    const distance = url.searchParams.get('distance') ? parseFloat(url.searchParams.get('distance')!) : undefined;

    const posts = await PostRepository.getAll(lat, long, distance);
    return {
        posts: posts.map(p => ({...p, lat: p.lat?.toString(), long: p.long?.toString()})) // Serialize decimals if needed, but they are numbers in types
    };
};
