import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
  // If the user already has a session, redirect them to the app
  if (locals.hasValidSession) {
    redirect(302, '/app');
  }
};