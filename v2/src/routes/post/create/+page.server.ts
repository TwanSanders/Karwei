import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { PostRepository } from '$lib/server/repositories/postRepository';
import { SkillRepository } from '$lib/server/repositories/skillRepository';
import { uploadToR2 } from '$lib/server/s3';

export const load: PageServerLoad = async ({ locals }) => {
    // Check auth - OPTIONAL now for viewing the wizard
    // We pass the user status to the frontend so the wizard knows whether to show "Post" or "Login"
    const userId = locals.user?.id;
    
    // Load active skills for the category dropdown
    const skills = await SkillRepository.getActive();
    
    return { skills };
};

export const actions = {
  create: async ({ request, locals }) => {
     if (!locals.user) {
         throw redirect(303, '/login');
     }
     const userId = locals.user.id;

     const data = await request.formData();
     const title = data.get('title') as string;
     const description = data.get('description') as string;
     const type = data.get('type') as string;
     const priceStr = data.get('price') as string;
     const price = priceStr ? parseFloat(priceStr) : undefined;
     
     // Extract location data
     const latStr = data.get('lat') as string;
     const longStr = data.get('long') as string;
     const lat = latStr && latStr !== '' ? parseFloat(latStr) : undefined;
     const long = longStr && longStr !== '' ? parseFloat(longStr) : undefined;
     
     const image = data.get('image') as File;
     let imageUrl = null;

     if (image && image.size > 0) {
         try {
             imageUrl = await uploadToR2(image);
         } catch (err) {
             console.error('Upload failed', err);
             // Optionally handle error, but for now continue or fail
         }
     }

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
         lat: lat ? lat.toString() : undefined,
         long: long ? long.toString() : undefined,
         purchasedAt: null // Optional
     });

     throw redirect(303, '/');
  }
} satisfies Actions;
