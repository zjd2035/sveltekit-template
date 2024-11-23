import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, cookies }) => {
  locals.user = null;
  locals.session = null;
  locals.hasValidSession = false;

  cookies.delete('auth_session', { path: '/' });

  // TODO: Also delete the session in the DB if it exists
  
  redirect(302, '/auth/login');
};
