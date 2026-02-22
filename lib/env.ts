function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const BACKEND_URL = requireEnv("BACKEND_URL");
export const X_APP_ID = requireEnv("X_APP_ID");
