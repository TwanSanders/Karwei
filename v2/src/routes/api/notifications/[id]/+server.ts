import { json } from '@sveltejs/kit';
import { NotificationRepository } from '$lib/server/repositories/notificationRepository';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async ({ params, locals }) => {
    if (!locals.user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
        return json({ error: 'Missing ID' }, { status: 400 });
    }

    try {
        console.log(`[Notification DELETE] Attempting to delete notification: ${id}`);
        await NotificationRepository.delete(id);
        console.log(`[Notification DELETE] Successfully deleted notification: ${id}`);
        return json({ success: true });
    } catch (error) {
        console.error('[Notification DELETE] Error deleting notification:', error);
        return json({ error: 'Internal Server Error' }, { status: 500 });
    }
};
