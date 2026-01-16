import { fail, redirect, error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { PostRepository } from '$lib/server/repositories/postRepository';
import { OfferRepository } from '$lib/server/repositories/offerRepository';
import { UserRepository } from '$lib/server/repositories/userRepository';
import { CommentRepository } from '$lib/server/repositories/commentRepository';

export const load: PageServerLoad = async ({ params, cookies }) => {
    const postId = params.id;
    const post = await PostRepository.getById(postId);
    
    if (!post) {
        throw error(404, 'Post not found');
    }

    const offers = await OfferRepository.getByPostId(postId);
    const postUser = await UserRepository.getById(post.userId);

    const offersWithMakers = await Promise.all(offers.map(async (offer) => {
        const maker = await UserRepository.getById(offer.makerId);
        return { ...offer, makerName: maker?.name, makerImage: maker?.image };
    }));

    const comments = await CommentRepository.getByPostId(postId);
    const commentsWithUsers = await Promise.all(comments.map(async (comment) => {
        const user = await UserRepository.getById(comment.userId);
        return { ...comment, userName: user?.name, userImage: user?.image };
    }));

    const userId = cookies.get('session_id');
    const currentUser = userId ? await UserRepository.getById(userId) : null;

    return {
        post,
        postUser,
        offers: offersWithMakers,
        comments: commentsWithUsers,
        currentUser
    };
};

export const actions = {
  offer: async ({ request, cookies, params }) => {
     const userId = cookies.get('session_id');
     if (!userId) {
         throw redirect(303, '/login');
     }

     const user = await UserRepository.getById(userId);
     if (!user?.maker) {
         return fail(403, { message: 'Only repairers can make offers' });
     }

     const data = await request.formData();
     const message = data.get('message') as string;
     const priceStr = data.get('price') as string;
     const price = priceStr ? parseFloat(priceStr) : undefined;

     if (!message) {
         return fail(400, { message, missing: true });
     }

     const postId = params.id;
     const post = await PostRepository.getById(postId);
     if (!post) throw error(404, 'Post not found');

     await OfferRepository.create({
        postId: postId,
        makerId: userId,
        userId: post.userId, // The customer being offered to
        message,
        price: price ? price.toString() : undefined
     });

     return { success: true };
  },

  comment: async ({ request, cookies, params }) => {
     const userId = cookies.get('session_id');
     if (!userId) {
         throw redirect(303, '/login');
     }

     const data = await request.formData();
     const message = data.get('message') as string;

     if (!message) {
         return fail(400, { message, missing: true });
     }

     const postId = params.id;
     const post = await PostRepository.getById(postId);
     if (!post) throw error(404, 'Post not found');

     await CommentRepository.create({
        postId: postId,
        userId: userId,
        message,
     });

     return { success: true };
  }
} satisfies Actions;
