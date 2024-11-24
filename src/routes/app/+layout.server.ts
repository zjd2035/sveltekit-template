
import { redirect } from '@sveltejs/kit'

// TODO: CHECK IF THE USER HAS A SESSION IN THE LOAD FUNCTION
// KICK THEM OUT IF NOT!
export const load = ({ locals }) => {
  if (!locals.hasValidSession || !locals.user || !locals.session) {
    redirect(302, '/');
  }
}