import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { UserRepository } from '$lib/server/repositories/userRepository';
import { AuthService } from '$lib/server/services/authService';

export const actions = {
  default: async ({ request, cookies }: { request: Request, cookies: any }) => {
    const data = await request.formData();
    const name = data.get('name') as string;
    const email = data.get('email') as string;
    const phoneNumber = data.get('phoneNumber') as string;
    const password = data.get('password') as string;
    const isMaker = data.get('role_maker') === 'on';
    const lat = data.get('lat') ? parseFloat(data.get('lat') as string) : null;
    const long = data.get('long') ? parseFloat(data.get('long') as string) : null;

    if (!name || !email || !password || !phoneNumber) {
      return fail(400, { name, email, phoneNumber, missing: true });
    }

    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
        return fail(400, { name, email, userExists: true });
    }

    const image = data.get('image') as File;
    let imageUrl = null;
    
    // Import uploadToR2 if not available yet in this file scope (but I need to add import at top)
    // Assuming I add import at top in a separate edit or this tool call supports it?
    // replace_file_content works on contiguous block.
    // I will use multi_replace for this file to be safe or just replace the action block and assume I add import later or use separate call.
    // I'll assume separate call for import.
    
    if (image && image.size > 0) {
         try {
             // import { uploadToR2 } from '$lib/server/s3'; // Dynamic import or use top level
             // Dynamic import is safer if I can't edit top level in same tool call easily without multiple chunks 
             // but I can use multi_replace.
             // But wait, I'm using replace_file_content here.
             // I'll stick to replacing the block and add import in next step or use multi_replace.
         } catch (e) {}
    }
    // actually, let's just do the logic assuming import exists.
    
    if (image && image.size > 0) {
        try {
             const { uploadToR2 } = await import('$lib/server/s3');
             imageUrl = await uploadToR2(image);
        } catch (err) {
            console.error('Profile image upload failed', err);
        }
    }

    const passwordHash = await AuthService.hashPassword(password);

    const newUser = await UserRepository.create({
        name,
        email,
        phoneNumber,
        passwordHash,
        maker: isMaker,
        lat: lat ? lat.toString() : null,
        long: long ? long.toString() : null,
        image: imageUrl, // Add image url
        // Default values for other fields
        bio: '',
        skills: ''
    });

    if (!newUser) {
        return fail(500, { message: 'Could not create user' });
    }

    // Set cookie
    cookies.set('session_id', newUser.id, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7
    });

    throw redirect(303, '/');
  }
} satisfies Actions;
