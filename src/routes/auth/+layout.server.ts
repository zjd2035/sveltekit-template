import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  // If the user already has a session, redirect them to the app
  if (locals.hasValidSession) {
    redirect(302, '/app');
  }
};