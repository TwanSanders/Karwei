import type { PageServerLoad } from './$types';
import { PostRepository } from '$lib/server/repositories/postRepository';
import { UserRepository } from '$lib/server/repositories/userRepository';
import { SkillRepository } from '$lib/server/repositories/skillRepository';

export const load: PageServerLoad = async ({ url, locals }) => {
    const userId = locals.user?.id;
    const skills = await SkillRepository.getActive();

    // Guest View (not logged in)
    if (!userId) {
        const topMakers = await UserRepository.getTopMakers(500);
        const latestPosts = await PostRepository.getLatest(5);
        
        return {
            topMakers: topMakers.map(m => ({...m, lat: m.lat?.toString(), long: m.long?.toString()})),
            latestPosts: latestPosts.map(p => ({...p, lat: p.lat?.toString(), long: p.long?.toString()})),
            skills,
            user: null
        };
    }

    // Get user data
    const user = await UserRepository.getById(userId);
    if (!user) {
        // Handle edge case
        return {
            topMakers: [],
            latestPosts: [],
            skills,
            user: null
        };
    }

    const userData = {
        id: user.id,
        name: user.name,
        image: user.image,
        lat: user.lat,
        long: user.long,
        maker: user.maker,
        skills: user.skills
    };

    // Maker View (user has maker role)
    if (user.maker) {
        // Get location data for find projects
        let lat = url.searchParams.get('lat') ? parseFloat(url.searchParams.get('lat')!) : undefined;
        let long = url.searchParams.get('long') ? parseFloat(url.searchParams.get('long')!) : undefined;
        const distance = url.searchParams.get('distance') ? parseFloat(url.searchParams.get('distance')!) : undefined;
        const skillsParam = url.searchParams.get('skills');
        const skillsFilter = skillsParam ? skillsParam.split(',').map(s => s.trim()).filter(Boolean) : undefined;
        const searchQuery = url.searchParams.get('q') || undefined;

        // Default to user's home location if not specified
        if (!lat || !long) {
            lat = user.lat || undefined;
            long = user.long || undefined;
        }

        const posts = await PostRepository.getAll(lat, long, distance, skillsFilter, searchQuery);
        const myProjects = await PostRepository.findByMakerId(userId);
        
        // Also get poster data for when they toggle to poster view
        const userPosts = await PostRepository.findByUserId(userId);
        const assignedPosts = userPosts.filter(p => p.status === 'in_progress');
        const unassignedPosts = userPosts.filter(p => p.status === 'open');

        // Fetch makers if filtered to makers
        const type = url.searchParams.get('type') || 'posts';
        let makers: any[] = [];
        
        if (type === 'makers') {
            makers = await UserRepository.getMakers(lat, long, distance, skillsFilter, searchQuery);
        }

        return {
            // Maker data
            myProjects: myProjects.map(p => ({...p, lat: p.lat?.toString(), long: p.long?.toString()})),
            posts: posts.map(p => ({...p, lat: p.lat?.toString(), long: p.long?.toString(), distance: p.distance})),
            makers: makers.map(m => ({...m, lat: m.lat?.toString(), long: m.long?.toString(), distance: m.distance})),
            // Poster data
            assignedPosts: assignedPosts.map(p => ({...p, lat: p.lat?.toString(), long: p.long?.toString()})),
            unassignedPosts: unassignedPosts.map(p => ({...p, lat: p.lat?.toString(), long: p.long?.toString()})),
            // Common
            searchType: type,
            user: userData,
            skills
        };
    }

    // Poster View (normal user, not maker)
    const userPosts = await PostRepository.findByUserId(userId);
    const assignedPosts = userPosts.filter(p => p.status === 'in_progress');
    const unassignedPosts = userPosts.filter(p => p.status === 'open');
    const latestPosts = await PostRepository.getLatest(5);

    return {
        assignedPosts: assignedPosts.map(p => ({...p, lat: p.lat?.toString(), long: p.long?.toString()})),
        unassignedPosts: unassignedPosts.map(p => ({...p, lat: p.lat?.toString(), long: p.long?.toString()})),
        latestPosts: latestPosts.map(p => ({...p, lat: p.lat?.toString(), long: p.long?.toString()})),
        user: userData,
        skills
    };
};
