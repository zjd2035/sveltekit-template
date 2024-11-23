import argon2 from 'argon2';

import type { Actions } from './$types';
import type { ActionFailure, Redirect } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

import { generateSessionToken, createSession, setSessionCookie } from '$lib/auth';

type loginActionResponse = Promise<
  ActionFailure<{
    error: string;
  }>
  | { formError: string }
  | Redirect
>

const getLoginData = async (request: Request) => {
  const formData = await request.formData();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  return { email, password };
}

export const actions: Actions = {
  default: async ({ cookies, request, locals }): loginActionResponse => {
    const { email, password } = await getLoginData(request);

    // The user didn't supply an email address or password
    if (!email || !password) {
      return {
        formError: 'Missing email or password',
      };
    }

    if (!locals.dbClient) {
      throw new Error('DB inaccessible');
    }

    try {
      const dbResult = await locals.dbClient.query(
        'SELECT id, password FROM app_user WHERE email=$1',
        [email]
      );

      // We couldn't find a user with that email address
      if (dbResult.rows.length === 0) {
        throw new Error('Incorrect email or password');
      }

      // The password wasn't correct
      if (!await argon2.verify(dbResult.rows[0].password, password)) {
        throw new Error('Incorrect email or password');
      }
      
      // The user provided a valid email and password combo!
      const userId = dbResult.rows[0].id;
      const token = generateSessionToken();
      const session = await createSession(token, userId, locals.dbClient);

      if (session) {
        // Store their session credentials in a cookie for future requests
        setSessionCookie(cookies, token, session.expiresAt);
      } else {
        return {
          formError: 'Something went wrong, please try again'
        };
      }
    } catch (error) {
      // Keep a consistent error message to the user
      return {
        formError: 'Incorrect email or password'
      };
    }

    // Redirect to the app dashboard
    redirect(302, '/app');
  }
};
