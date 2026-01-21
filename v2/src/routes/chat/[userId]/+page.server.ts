import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { ChatRepository } from '$lib/server/repositories/chatRepository';
import { UserRepository } from '$lib/server/repositories/userRepository';

export const load: PageServerLoad = async ({ params, cookies }) => {
	const userId = cookies.get('session_id');
	if (!userId) throw redirect(303, '/login');

	const partnerId = params.userId;

	// Can't chat with yourself
	if (userId === partnerId) {
		throw error(400, 'Cannot chat with yourself');
	}

	// Get partner details
	const partner = await UserRepository.getById(partnerId);
	if (!partner) {
		throw error(404, 'User not found');
	}

	// Get or create conversation
	const conversationId = await ChatRepository.getOrCreateConversation(userId, partnerId);

	// Load messages
	const messagesWithSender = await ChatRepository.getMessages(conversationId);

	// Query active jobs between these users
	const activeJobs = await ChatRepository.getActiveJobsBetweenUsers(userId, partnerId);
    
    // Check permissions: Must have accepted contact request OR active/fixed job
    const hasContact = await ChatRepository.hasAcceptedContactRequest(userId, partnerId);
    
    if (!hasContact && activeJobs.length === 0) {
        throw error(403, 'You must have an accepted contact request or active job to chat.');
    }

	// Get current user details
	const currentUser = await UserRepository.getById(userId);

	// Mark conversation as read
	await ChatRepository.markConversationAsRead(conversationId, userId);

	return {
		conversationId,
		messages: messagesWithSender,
		partner,
		activeJobs,
		currentUser,
	};
};

export const actions = {
	sendMessage: async ({ request, cookies, params }) => {
		const userId = cookies.get('session_id');
		if (!userId) throw redirect(303, '/login');

		const data = await request.formData();
		const content = data.get('content') as string;
		const image = data.get('image') as File;

		// Validation: Must have at least one of them
		if ((!content || content.trim().length === 0) && (!image || image.size === 0)) {
			return { success: false, error: 'Message cannot be empty' };
		}

		const partnerId = params.userId;

		// Get conversation ID
		const conversationId = await ChatRepository.getOrCreateConversation(userId, partnerId);

		// 1. Handle Image Upload if present
		if (image && image.size > 0) {
			try {
				const { uploadToR2 } = await import('$lib/server/s3');
				const imageUrl = await uploadToR2(image);
				
				await ChatRepository.sendMessage(
					conversationId, 
					userId, 
					imageUrl, 
					'image'
				);
			} catch (error) {
				console.error('Image upload failed:', error);
				return { success: false, error: 'Failed to upload image' };
			}
		}

		// 2. Handle Text Message if present
		if (content && content.trim().length > 0) {
			await ChatRepository.sendMessage(
				conversationId, 
				userId, 
				content.trim(), 
				'text'
			);
		}

		return { success: true };
	},
} satisfies Actions;
