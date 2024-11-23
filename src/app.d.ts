import type { PoolClient } from 'pg';

interface User {
  id: number;
}

interface Session {
  id: string;
  userId: number;
  expiresAt: Date;
}

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user: User | null;
			session: Session | null;
			hasValidSession: boolean | null;
			dbClient: PoolClient;
		}
		
		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
