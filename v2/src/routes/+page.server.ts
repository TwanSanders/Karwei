import type { PageServerLoad } from './$types';
import { PostRepository } from '$lib/server/repositories/postRepository';

import { UserRepository } from '$lib/server/repositories/userRepository';

export const load: PageServerLoad = async ({ url, cookies }) => {
    let lat = url.searchParams.get('lat') ? parseFloat(url.searchParams.get('lat')!) : undefined;
    let long = url.searchParams.get('long') ? parseFloat(url.searchParams.get('long')!) : undefined;
    const distance = url.searchParams.get('distance') ? parseFloat(url.searchParams.get('distance')!) : undefined;

    const userId = cookies.get('session_id');
    if (userId && (!lat || !long)) {
        const user = await UserRepository.getById(userId);
        if (user && user.lat && user.long) {
            lat = user.lat;
            long = user.long;
        }
    }

    const posts = await PostRepository.getAll(lat, long, distance);
    
    // Fetch makers if filtered to makers
    const type = url.searchParams.get('type') || 'posts';
    let makers: any[] = [];
    
    if (type === 'makers') {
        makers = await UserRepository.getMakers(lat, long, distance);
    }

    return {
        posts: posts.map(p => ({...p, lat: p.lat?.toString(), long: p.long?.toString()})),
        makers: makers.map(m => ({...m, lat: m.lat?.toString(), long: m.long?.toString()})),
        searchType: type
    };
};
