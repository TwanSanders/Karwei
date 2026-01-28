import { fail, redirect } from '@sveltejs/kit';
import { lucia } from "$lib/server/auth";
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

    // Create session
    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    
    // Set cookie
    cookies.set(sessionCookie.name, sessionCookie.value, {
      path: ".",
      ...sessionCookie.attributes
    });

    // Handle smart redirect
    const url = new URL(request.url);
    const redirectTo = url.searchParams.get('redirectTo');
    
    if (redirectTo) {
        throw redirect(303, redirectTo);
    }

    throw redirect(303, '/');
  },
  
  logout: async ({ locals, cookies }) => {
    if (!locals.session) return fail(401);
    await lucia.invalidateSession(locals.session.id);
    const sessionCookie = lucia.createBlankSessionCookie();
    cookies.set(sessionCookie.name, sessionCookie.value, {
      path: ".",
      ...sessionCookie.attributes
    });
    throw redirect(303, '/login');
  }
} satisfies Actions;
