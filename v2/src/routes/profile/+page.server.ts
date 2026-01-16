import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { UserRepository } from '$lib/server/repositories/userRepository';
import { ContactRequestRepository } from '$lib/server/repositories/contactRequestRepository';

export const load: PageServerLoad = async ({ cookies }) => {
    const userId = cookies.get('session_id');
    if (!userId) {
        throw redirect(303, '/login');
    }

    const user = await UserRepository.getById(userId);
    if (!user) {
        throw redirect(303, '/login');
    }

    const incomingRequests = await ContactRequestRepository.getByTargetUser(userId);
    const requestsWithUsers = await Promise.all(incomingRequests.map(async (req) => {
        const requester = await UserRepository.getById(req.requesterId);
        return { ...req, requesterName: requester?.name };
    }));

    return {
        user,
        incomingRequests: requestsWithUsers
    };
};

export const actions = {
    toggleMaker: async ({ cookies }) => {
        const userId = cookies.get('session_id');
        if (!userId) {
            throw redirect(303, '/login');
        }

        const user = await UserRepository.getById(userId);
        if (!user) {
            throw redirect(303, '/login');
        }

        await UserRepository.update(userId, {
            maker: !user.maker
        });

        return { success: true };
    },
    updateImage: async ({ request, cookies }) => {
        const userId = cookies.get('session_id');
        if (!userId) throw redirect(303, '/login');

        const data = await request.formData();
        const image = data.get('image') as File;

        if (image && image.size > 0) {
            try {
                // Dynamic import to avoid circular dependencies or load only when needed
                const { uploadToR2 } = await import('$lib/server/s3');
                const imageUrl = await uploadToR2(image);
                
                await UserRepository.update(userId, {
                    image: imageUrl
                });
            } catch (err) {
                console.error('Update profile image failed', err);
                return fail(500, { message: 'Upload failed' });
            }
        }
        
        return { success: true };
    },
    respondRequest: async ({ request, cookies }) => {
        const userId = cookies.get('session_id');
        if (!userId) throw redirect(303, '/login');

        const formData = await request.formData();
        const requestId = formData.get('requestId') as string;
        const status = formData.get('status') as 'accepted' | 'denied';

        if (!requestId || !status) return fail(400, { missing: true });

        // Verify ownership (optional but good practice, though repository doesn't fully check yet)
        // Ideally verify that the request belongs to the current user

        await ContactRequestRepository.updateStatus(requestId, status);
        return { success: true };
    },
    logout: async ({ cookies }) => {
        cookies.delete('session_id', { path: '/' });
        throw redirect(303, '/');
    }
} satisfies Actions;
