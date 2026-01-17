import { json } from '@sveltejs/kit';
import { NotificationRepository } from '$lib/server/repositories/notificationRepository';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals }) => {
    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await NotificationRepository.markAllAsRead(locals.user.id);
        return json({ success: true });
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        return json({ error: 'Internal Server Error' }, { status: 500 });
    }
};
