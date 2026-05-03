// ═══════════════════════════════════
// Environment configuration
// ═══════════════════════════════════

function env(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

export const config = {
  port: parseInt(env('PORT', '3001'), 10),
  nodeEnv: env('NODE_ENV', 'development'),

  db: {
    url: env('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/saiyan_protocol'),
  },

  jwt: {
    secret: env('JWT_SECRET', 'dev-secret-change-in-prod'),
    expiresIn: env('JWT_EXPIRES_IN', '7d'),
  },

  firebase: {
    projectId: env('FIREBASE_PROJECT_ID', 'saiyan-protocol'),
  },

  ai: {
    provider: env('AI_PROVIDER', 'stub'),
    apiKey: env('AI_API_KEY', ''),
    model: env('AI_MODEL', ''),
  },
} as const;
