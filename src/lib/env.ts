// src/lib/env.ts
// Minimal runtime env validation and typed access

type Booleanish = 'true' | 'false' | undefined;

function toBoolean(value: Booleanish, fallback: boolean = false): boolean {
	if (value === 'true') return true;
	if (value === 'false') return false;
	return fallback;
}

function requireEnv(name: string): string {
	const value = process.env[name];
	if (!value || value.trim() === '') {
		throw new Error(`Missing required environment variable: ${name}`);
	}
	return value;
}

export const env = {
	// Required secrets
	JWT_SECRET: requireEnv('JWT_SECRET'),
	MONGODB_URI: requireEnv('MONGODB_URI'),

	// Optional public config
	NODE_ENV: process.env.NODE_ENV || 'development',
	NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
	VERCEL_URL: process.env.VERCEL_URL,

	// Security toggles
	SECURE_COOKIES: toBoolean(process.env.SECURE_COOKIES as Booleanish, process.env.NODE_ENV === 'production'),
};

// Eager log (non-sensitive)
export function logEnvSummary(): void {
	const flags = {
		NODE_ENV: env.NODE_ENV,
		SECURE_COOKIES: env.SECURE_COOKIES,
		NEXT_PUBLIC_VERCEL_URL: Boolean(env.NEXT_PUBLIC_VERCEL_URL),
		VERCEL_URL: Boolean(env.VERCEL_URL)
	};
	console.log('[env] Loaded environment:', flags);
}


