import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { ChatRepository } from '$lib/server/repositories/chatRepository';
import { UserRepository } from '$lib/server/repositories/userRepository';
import { ContactRequestRepository } from '$lib/server/repositories/contactRequestRepository';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;
	if (!user) throw redirect(303, '/login');
	const userId = user.id;

	// Get all conversations for the user
	const conversations = await ChatRepository.getUserConversations(userId);

	// Get incoming contact requests
	const incomingRequests = await ContactRequestRepository.getByTargetUser(userId);
	const requestsWithUsers = await Promise.all(incomingRequests.map(async (req) => {
		const requester = await UserRepository.getById(req.requesterId);
		return { ...req, requesterName: requester?.name, requesterImage: requester?.image };
	}));

	return {
		conversations,
		incomingRequests: requestsWithUsers.filter(r => r.status === 'pending')
	};
};

export const actions: Actions = {
	respondRequest: async ({ request, locals }) => {
		if (!locals.user) throw redirect(303, '/login');

		const formData = await request.formData();
		const requestId = formData.get('requestId') as string;
		const status = formData.get('status') as 'accepted' | 'denied';

		if (!requestId || !status) return fail(400, { missing: true });

		await ContactRequestRepository.updateStatus(requestId, status);
		
		// If accepted, we might want to automatically create a conversation or just let them start one.
		// For now, the status update triggers a notification to the requester.
		
		return { success: true };
	}
};
