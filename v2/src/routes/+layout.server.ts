import type { LayoutServerLoad } from './$types';
import { UserRepository } from '$lib/server/repositories/userRepository';
import { NotificationRepository } from '$lib/server/repositories/notificationRepository';

export const load: LayoutServerLoad = async ({ locals }) => {
    if (locals.user) {
        const unreadCount = await NotificationRepository.getUnreadCount(locals.user.id);
        const notifications = await NotificationRepository.getByUser(locals.user.id, true);
        const { ChatRepository } = await import('$lib/server/repositories/chatRepository');
        const unreadMessagesCount = await ChatRepository.getUnreadMessageCount(locals.user.id);
        const { ContactRequestRepository } = await import('$lib/server/repositories/contactRequestRepository');
        const pendingRequestCount = await ContactRequestRepository.getPendingCount(locals.user.id);
        
        return {
            user: locals.user,
            unreadCount,
            notifications,
            unreadMessagesCount,
            pendingRequestCount
        };
    }
    
    return {
        user: null,
        unreadCount: 0,
        notifications: [],
        unreadMessagesCount: 0,
        pendingRequestCount: 0
    };
};
