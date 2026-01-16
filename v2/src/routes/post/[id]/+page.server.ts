import { fail, redirect, error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { PostRepository } from '$lib/server/repositories/postRepository';
import { OfferRepository } from '$lib/server/repositories/offerRepository';
import { UserRepository } from '$lib/server/repositories/userRepository';
import { CommentRepository } from '$lib/server/repositories/commentRepository';
import { ReviewRepository } from '$lib/server/repositories/reviewRepository';

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
  },

  acceptOffer: async ({ request, cookies, params }) => {
      const userId = cookies.get('session_id');
      if (!userId) throw redirect(303, '/login');

      const data = await request.formData();
      const offerId = data.get('offerId') as string;
      const makerId = data.get('makerId') as string;

      if (!offerId || !makerId) return fail(400, { missing: true });

      const postId = params.id;
      const post = await PostRepository.getById(postId);

      if (!post) throw error(404, 'Post not found');
      if (post.userId !== userId) return fail(403, { unauthorized: true });

      await PostRepository.assignMaker(postId, makerId);
      return { success: true };
  },

  markFixed: async ({ cookies, params }) => {
      const userId = cookies.get('session_id');
      if (!userId) throw redirect(303, '/login');

      const postId = params.id;
      const post = await PostRepository.getById(postId);

      if (!post) throw error(404, 'Post not found');
      if (post.userId !== userId) return fail(403, { unauthorized: true });

      await PostRepository.updateStatus(postId, 'fixed');
      return { success: true };
  },

  submitReview: async ({ request, cookies, params }) => {
      const userId = cookies.get('session_id');
      if (!userId) throw redirect(303, '/login');

      const data = await request.formData();
      const ratingStr = data.get('rating') as string;
      const comment = data.get('comment') as string;

      if (!ratingStr) return fail(400, { missing: true });

      const postId = params.id;
      const post = await PostRepository.getById(postId);

      if (!post) throw error(404, 'Post not found');
      if (post.userId !== userId) return fail(403, { unauthorized: true });
      if (!post.makerId) return fail(400, { message: 'No maker assigned' });

      await ReviewRepository.create({
          reviewerId: userId,
          targetUserId: post.makerId,
          postId: postId,
          rating: ratingStr,
          comment
      });

      await PostRepository.updateStatus(postId, 'closed');
      return { success: true };
  }
} satisfies Actions;
