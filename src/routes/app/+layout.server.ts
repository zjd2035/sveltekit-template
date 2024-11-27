import { redirect } from '@sveltejs/kit'

export const load = ({ locals }) => {
  // If the user doesn't have an active session, redirect them to login
  if (!locals.hasValidSession || !locals.user || !locals.session) {
    redirect(302, '/auth/login');
  }
}