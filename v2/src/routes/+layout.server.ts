import type { LayoutServerLoad } from './$types';
import { UserRepository } from '$lib/server/repositories/userRepository';

export const load: LayoutServerLoad = async ({ cookies }) => {
    const userId = cookies.get('session_id');
    
    if (userId) {
        const user = await UserRepository.getById(userId);
        return {
            user
        };
    }
    
    return {
        user: null
    };
};
