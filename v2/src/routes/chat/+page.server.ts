import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ChatRepository } from '$lib/server/repositories/chatRepository';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;
	if (!user) throw redirect(303, '/login');
	const userId = user.id;

	// Get all conversations for the user
	const conversations = await ChatRepository.getUserConversations(userId);

	return {
		conversations,
	};
};
