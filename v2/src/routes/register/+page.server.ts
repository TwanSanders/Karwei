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

    if (!name || !email || !password || !phoneNumber) {
      return fail(400, { name, email, phoneNumber, missing: true });
    }

    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
        return fail(400, { name, email, userExists: true });
    }

    const passwordHash = await AuthService.hashPassword(password);

    const newUser = await UserRepository.create({
        name,
        email,
        phoneNumber,
        passwordHash,
        maker: isMaker,
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
