const MIN_JWT_SECRET_LENGTH = 32;
const DEFAULT_PORT = 4000;

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Environment variable ${name} is required (see server/.env.example)`);
  return value;
}

export function loadConfig() {
  const jwtSecret = requireEnv('JWT_SECRET');
  if (jwtSecret.length < MIN_JWT_SECRET_LENGTH) {
    throw new Error(`JWT_SECRET must be at least ${MIN_JWT_SECRET_LENGTH} characters`);
  }

  return {
    databaseUrl: requireEnv('DATABASE_URL'),
    jwtSecret,
    port: Number(process.env.PORT ?? DEFAULT_PORT),
    isProduction: process.env.NODE_ENV === 'production',
  };
}

export type Config = ReturnType<typeof loadConfig>;
