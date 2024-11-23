import type { Handle } from "@sveltejs/kit";
import type { PoolClient } from 'pg';
import { sequence } from '@sveltejs/kit/hooks';
import { connectToDB } from '$lib/db';
import {
	validateSessionToken,
	setSessionCookie,
	deleteSessionCookie
} from "$lib/auth";


const handleDB: Handle = async ({ event, resolve }) => {
  // Add the DB connection to the event locals
  const dbClient: PoolClient = await connectToDB();
  event.locals.dbClient = dbClient;
  
  // Release the DB connection when finished
  const response = await resolve(event);
  dbClient.release();
  return response;
}

const handleSession: Handle = async ({ event, resolve }) => {
  // Grab the user's session token from the request cookies
  const token = event.cookies.get("auth_session") ?? null;

  // If they don't have a session token, clear the related locals and resolve
  if (token === null) {
    event.locals.user = null;
    event.locals.session = null;
    event.locals.hasValidSession = false;

    return resolve(event);
  }

  // If they have a session token, validate it
  const { session, user } = await validateSessionToken(token, event.locals.dbClient);

  if (session === null || user === null) {
    // If the session token is invalid, delete the cookie and clear the locals
    deleteSessionCookie(event.cookies);

    event.locals.user = null;
    event.locals.session = null;
    event.locals.hasValidSession = false;
  } else {
    // Otherwise they have a valid session!

    event.locals.user = user;
    event.locals.session = session;
    event.locals.hasValidSession = true;
  }

  return resolve(event);
};

export const handle = sequence(handleDB, handleSession);
