import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ChatRepository } from '$lib/server/repositories/chatRepository';

export const load: PageServerLoad = async ({ cookies }) => {
	const userId = cookies.get('session_id');
	if (!userId) throw redirect(303, '/login');

	// Get all conversations for the user
	const conversations = await ChatRepository.getUserConversations(userId);

	return {
		conversations,
	};
};
