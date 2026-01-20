import { redirect, error } from '@sveltejs/kit';
import { NotificationRepository } from '$lib/server/repositories/notificationRepository';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
    if (!locals.user) {
        throw redirect(303, '/login');
    }

    const { id } = params;
    if (!id) {
        throw error(400, 'Missing notification ID');
    }

    const notification = await NotificationRepository.getById(id);

    if (!notification) {
        throw error(404, 'Notification not found');
    }

    // Security check: ensure notification belongs to user
    if (notification.userId !== locals.user.id) {
        throw error(403, 'Unauthorized');
    }

    // Determine redirect URL
    let targetUrl = '/';

    if (notification.type === 'contact_request') {
        if (notification.contactRequesterId === locals.user.id) {
             // If I am the requester (I asked), and it's an update (accepted), go to the User's profile
             targetUrl = `/user/${notification.contactTargetUserId}`;
        } else {
             // If I am the target (someone asked me), go to my profile to approve/deny
             targetUrl = `/profile#request-${notification.relatedId}`;
        }
    } else if (notification.type === 'offer' || notification.type === 'accept') {
        // For offers and accepts, go to the post
        if (notification.postId) {
             targetUrl = `/post/${notification.postId}`;
        }
    }

    // Delete the notification
    await NotificationRepository.delete(id);

    // Redirect
    throw redirect(303, targetUrl);
};
