import argon2 from 'argon2';
import type { Actions } from './$types';
import type { ActionFailure, Redirect } from '@sveltejs/kit';
import { fail, redirect } from '@sveltejs/kit';


type signUpActionResponse = Promise<
  ActionFailure<{
    error: string;
  }>
  | { formError: string }
  | Redirect
>

const getSignupData = async (request: Request) => {
  const formData = await request.formData();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  return { email, password, confirmPassword };
}

export const actions: Actions = {
  default: async ({ cookies, request, locals }): signUpActionResponse => {
    const { email, password, confirmPassword } = await getSignupData(request);

    if (!email || !password || !confirmPassword) {
      return {
        formError: 'You must fill out all of the fields'
      };
    }

    if (!locals.dbClient) {
      throw new Error('DB inaccessible');
    }

    // Do some more validation on the password.. at least length
    if (password != confirmPassword) {
      return {
        formError: 'The passwords do not match'
      };
    } else if (password.length < 8) {
      return {
        formError: 'Your password must be at least 8 characters long'
      };
    }

    try {
      const pwHash = await argon2.hash(password);
      await locals.dbClient.query(
        'INSERT INTO app_user (email, password) VALUES ($1, $2)',
        [email, pwHash]
      );
    } catch (dbError) {
      if (dbError === null) {
        console.log('Unknown error occurred on signup.');
        console.log(dbError);

        return fail(500, {
          error: 'Unknown error occurred.'
        });
      } else if (typeof dbError === 'object') {
        let formError = '';
        if (dbError.hasOwnProperty('code') && dbError.code === '23505') {
          formError = 'That email address is already in use.';
        } else {
          formError = 'Failed to create the user in the database.';
        }

        return {
          formError
        };
      } else {
        console.log('Unknown error occurred on signup.');
        console.log(dbError);

        return fail(500, {
          error: 'Unknown error occurred.'
        });
      }
    }

    // Redirect to the login page
    redirect(302, '/auth/login');
  }
};
