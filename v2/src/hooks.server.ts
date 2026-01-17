import type { Handle } from '@sveltejs/kit';
import { UserRepository } from '$lib/server/repositories/userRepository';

export const handle: Handle = async ({ event, resolve }) => {
    const sessionId = event.cookies.get('session_id');

    if (sessionId) {
        const user = await UserRepository.getById(sessionId);
        if (user) {
            event.locals.user = user;
        } else {
            event.locals.user = null;
        }
    } else {
        event.locals.user = null;
    }

    return resolve(event);
};
