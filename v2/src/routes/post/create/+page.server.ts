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

     // 1. Validate File Type and Size
     const MAX_SIZE = 5 * 1024 * 1024; // 5MB
     const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

     if (image && image.size > 0) {
         if (image.size > MAX_SIZE) {
             return fail(400, { 
                 error: "Image too large. Max 5MB allowed.", 
                 title, 
                 description, 
                 type, 
                 price: priceStr 
             });
         }
         
         if (!ALLOWED_TYPES.includes(image.type)) {
             return fail(400, { 
                 error: "Invalid file type. Only JPG, PNG, and WEBP are allowed.", 
                 title, 
                 description, 
                 type, 
                 price: priceStr 
             });
         }

         try {
             imageUrl = await uploadToR2(image);
         } catch (err) {
             console.error('Upload failed', err);
             // 2. Do NOT continue if upload fails. Return an error to the user.
             return fail(500, { 
                 error: "Image upload failed. Please try again later.", 
                 title, 
                 description, 
                 type, 
                 price: priceStr 
             });
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
