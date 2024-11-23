import type { PoolClient } from 'pg';
import * as crypto from 'crypto';
import type { Cookies } from '@sveltejs/kit';

export interface User {
	id: number;
}

export interface Session {
	id: string;
	userId: number;
	expiresAt: Date;
}

export type SessionValidationResult =
	| { session: Session; user: User }
	| { session: null; user: null };


const generateSessionToken = (): string => {
  const bytes = crypto.randomBytes(24);
  const token = bytes.toString('base64');

  return token;
}

const generateSessionId = async (token: string): Promise<string> => {
  const encoder = new TextEncoder();
  const tokenData = encoder.encode(token);

	const decoder = new TextDecoder();
  const hashArrayBuffer = await crypto.subtle.digest('SHA-256', tokenData);
	const sessionId = decoder.decode(hashArrayBuffer);

  return sessionId;
}

const createSession = async (
	token: string,
	userId: number,
	dbClient: PoolClient
): Promise<Session | null> => {
  const sessionId = await generateSessionId(token);

	const session: Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
	};

	try {
		await dbClient.query(
			'INSERT INTO user_session (id, user_id, expires_at) VALUES ($1, $2, $3)',
			[session.id, session.userId, session.expiresAt]
		);
	} catch (e) {
		console.log('Failed to create user session with the following error:');
		console.log(e)

		return null;
	}

	return session;
}

const validateSessionToken = async (
	token: string,
	dbClient: PoolClient
): Promise<SessionValidationResult> => {
	const sessionId = await generateSessionId(token);
	const result = await dbClient.query(
		'SELECT id, user_id, expires_at FROM user_session WHERE id = $1',
		[sessionId]
	);

	if (result.rows.length === 0) {
		return { session: null, user: null };
	}

	const row = result.rows[0];
	const session: Session = {
		id: row.id,
		userId: row.user_id,
		expiresAt: new Date(row.expires_at)
	};

	const user: User = {
		id: row.user_id
	};


	if (Date.now() >= session.expiresAt.getTime()) {
		await dbClient.query("DELETE FROM user_session WHERE id = $1", [session.id]);

		return { session: null, user: null };
	}

	if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
		session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
		await dbClient.query(
			"UPDATE user_session SET expires_at = $1 WHERE id = $2",
			[
				Math.floor(session.expiresAt.getTime() / 1000),
				session.id
			]
		);
	}

	return { session, user };
}

const invalidateSession = async (sessionId: string, dbClient: PoolClient): Promise<void> => {
	await dbClient.query("DELETE FROM user_session WHERE id = $1", [sessionId]);
}

const clearExpiredSessions = async (userId: number, dbClient: PoolClient): Promise<void> => {
	await dbClient.query(
		"DELETE FROM user_session WHERE user_id = $1 AND expires_at < now()",
		[userId]
	);
}

const setSessionCookie = (cookies: Cookies, token: string, expiresAt: Date): void => {
	cookies.set("auth_session", token, {
		httpOnly: true,
		sameSite: "strict",
		expires: expiresAt,
		path: "/"
	});
}

const deleteSessionCookie = (cookies: Cookies): void => {
	cookies.set("auth_session", "", {
		httpOnly: true,
		sameSite: "strict",
		maxAge: 0,
		path: "/"
	});
}

export {
  generateSessionToken,
  createSession,
  validateSessionToken,
  invalidateSession,
	clearExpiredSessions,
	setSessionCookie,
	deleteSessionCookie
};
