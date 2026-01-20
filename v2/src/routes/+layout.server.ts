import type { LayoutServerLoad } from './$types';
import { UserRepository } from '$lib/server/repositories/userRepository';
import { NotificationRepository } from '$lib/server/repositories/notificationRepository';

export const load: LayoutServerLoad = async ({ locals }) => {
    if (locals.user) {
        const unreadCount = await NotificationRepository.getUnreadCount(locals.user.id);
        const notifications = await NotificationRepository.getByUser(locals.user.id, true);
        return {
            user: locals.user,
            unreadCount,
            notifications
        };
    }
    
    return {
        user: null,
        unreadCount: 0,
        notifications: []
    };
};
