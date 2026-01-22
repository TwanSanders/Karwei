import type { PageServerLoad } from './$types';
import { PostRepository } from '$lib/server/repositories/postRepository';
import { UserRepository } from '$lib/server/repositories/userRepository';
import { SkillRepository } from '$lib/server/repositories/skillRepository';

export const load: PageServerLoad = async ({ url, locals }) => {
    let lat = url.searchParams.get('lat') ? parseFloat(url.searchParams.get('lat')!) : undefined;
    let long = url.searchParams.get('long') ? parseFloat(url.searchParams.get('long')!) : undefined;
    const distance = url.searchParams.get('distance') ? parseFloat(url.searchParams.get('distance')!) : undefined;
    const skillsParam = url.searchParams.get('skills');
    const skillsFilter = skillsParam ? skillsParam.split(',').map(s => s.trim()).filter(Boolean) : undefined;
    const searchQuery = url.searchParams.get('q') || undefined;

    const userId = locals.user?.id;
    if (userId && (!lat || !long)) {
        const user = await UserRepository.getById(userId);
        if (user && user.lat && user.long) {
            lat = user.lat;
            long = user.long;
        }
    }

    const posts = await PostRepository.getAll(lat, long, distance, skillsFilter, searchQuery);
    
    // Fetch makers if filtered to makers
    const type = url.searchParams.get('type') || 'posts';
    let makers: any[] = [];
    
    if (type === 'makers') {
        makers = await UserRepository.getMakers(lat, long, distance, skillsFilter, searchQuery);
    }

    // Pass user data to client (including home location and skills)
    let userData = null;
    if (userId) {
        const user = await UserRepository.getById(userId);
        if (user) {
            userData = {
                id: user.id,
                name: user.name,
                image: user.image,
                lat: user.lat,
                long: user.long,
                maker: user.maker,
                skills: user.skills
            };
        }
    }

    const skills = await SkillRepository.getActive();

    return {
        // @ts-ignore
        posts: posts.map(p => ({...p, lat: p.lat?.toString(), long: p.long?.toString(), distance: p.distance})),
        // @ts-ignore
        makers: makers.map(m => ({...m, lat: m.lat?.toString(), long: m.long?.toString(), distance: m.distance})),
        searchType: type,
        user: userData,
        skills: skills.map(s => s.name)
    };
};
