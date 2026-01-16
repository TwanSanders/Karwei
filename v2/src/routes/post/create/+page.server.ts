import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { PostRepository } from '$lib/server/repositories/postRepository';

export const load: PageServerLoad = async ({ locals, cookies }) => {
    // Check auth
    const userId = cookies.get('session_id');
    if (!userId) {
        throw redirect(303, '/login');
    }
    return {};
};

export const actions = {
  create: async ({ request, cookies }) => {
     const userId = cookies.get('session_id');
     if (!userId) {
         throw redirect(303, '/login');
     }

     const data = await request.formData();
     const title = data.get('title') as string;
     const description = data.get('description') as string;
     const type = data.get('type') as string;
     const priceStr = data.get('price') as string;
     const price = priceStr ? parseFloat(priceStr) : undefined;
     const imageUrl = data.get('imageUrl') as string; // Ideally file upload, keeping simplied for now

     if (!title || !description) {
         return fail(400, { title, description, missing: true });
     }

     await PostRepository.create({
         userId,
         title,
         description,
         type,
         targetPrice: price ? price.toString() : undefined, // Drizzle expects string for decimal or we handle it
         imageUrl,
         purchasedAt: null // Optional
     });

     throw redirect(303, '/');
  }
} satisfies Actions;
