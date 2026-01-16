import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { UserRepository } from '$lib/server/repositories/userRepository';
import { AuthService } from '$lib/server/services/authService';

export const actions = {
  login: async ({ request, cookies }: { request: Request, cookies: any }) => {
    const data = await request.formData();
    const email = data.get('email') as string;
    const password = data.get('password') as string;

    if (!email || !password) {
      return fail(400, { email, missing: true });
    }

    const result = await UserRepository.findByEmailWithPassword(email);

    if (!result || !result.user || !result.passwordHash) {
      return fail(400, { email, incorrect: true });
    }

    const { user, passwordHash } = result;
    const isValid = await AuthService.verifyPassword(password, passwordHash);

    if (!isValid) {
      return fail(400, { email, incorrect: true });
    }

    // Set cookie
    cookies.set('session_id', user.id, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    throw redirect(303, '/');
  },
  
  logout: async ({ cookies }) => {
      cookies.delete('session_id', { path: '/' });
      throw redirect(303, '/login');
  }
} satisfies Actions;
