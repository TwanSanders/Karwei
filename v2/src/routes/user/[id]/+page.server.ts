import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { UserRepository } from '$lib/server/repositories/userRepository';
import { ContactRequestRepository } from '$lib/server/repositories/contactRequestRepository';
import { ReviewRepository } from '$lib/server/repositories/reviewRepository';

export const load: PageServerLoad = async ({ params, locals }) => {
    const userId = locals.user?.id;
    const targetUserId = params.id;
    
    // User cannot view their own public profile in this flow (optional restriction, or redirect to /profile)
    // if (userId === targetUserId) {
    //     throw redirect(303, '/profile');
    // }

    const targetUser = await UserRepository.getById(targetUserId);
    if (!targetUser) {
        throw redirect(303, '/');
    }

    let contactRequest = null;
    let canViewContact = false;

    if (userId) {
        if (userId === targetUserId) {
            canViewContact = true;
        } else {
            contactRequest = await ContactRequestRepository.getStatus(userId, targetUserId);
            if (contactRequest?.status === 'accepted') {
                canViewContact = true;
            } else {
                // Check if they requested us and it is accepted (Mutual Exchange)
                const inverseRequest = await ContactRequestRepository.getStatus(targetUserId, userId);
                if (inverseRequest?.status === 'accepted') {
                    canViewContact = true;
                    // Optionally set contactRequest to inverseRequest so the UI knows there is a connection
                    if (!contactRequest) contactRequest = inverseRequest;
                }
            }
        }
    }

    if (!canViewContact) {
        targetUser.email = 'Hidden';
        targetUser.phoneNumber = 'Hidden';
    }

    const reviews = await ReviewRepository.getByTargetUserId(targetUserId);
    const averageRating = await ReviewRepository.getAverageRating(targetUserId);
    
    // Calculate level and completed repairs count
    const completedRepairs = await UserRepository.countCompletedRepairs(targetUserId);
    const level = UserRepository.calculateLevel(completedRepairs);

    return {
        publicUser: { ...targetUser, completedRepairs, level },
        contactRequest,
        currentUserId: userId,
        reviews,
        averageRating
    };
};

export const actions = {
  requestContact: async ({ locals, params }) => {
     if (!locals.user) {
         throw redirect(303, '/login');
     }
     const requesterId = locals.user.id;

     const targetUserId = params.id;
     
     if (requesterId === targetUserId) {
         return fail(400, { message: 'Cannot request contact info from yourself' });
     }

     const existingRequest = await ContactRequestRepository.getStatus(requesterId, targetUserId);
     if (existingRequest) {
         return fail(400, { message: 'Request already exists' });
     }

     await ContactRequestRepository.create(requesterId, targetUserId);

     return { success: true };
  }
} satisfies Actions;
