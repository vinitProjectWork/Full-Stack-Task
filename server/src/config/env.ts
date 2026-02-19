import dotenv from 'dotenv';

dotenv.config();

// ---------------------------------------------------------------------------
// Environment configuration with validation
// ---------------------------------------------------------------------------

export interface EnvConfig {
  PORT: number;
  SQUARE_ACCESS_TOKEN: string;
  SQUARE_ENVIRONMENT: 'sandbox' | 'production';
  SQUARE_BASE_URL: string;
  CACHE_TTL_SECONDS: number;
  NODE_ENV: string;
}

function validateAndBuildConfig(): EnvConfig {
  const token = process.env.SQUARE_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      'Missing SQUARE_ACCESS_TOKEN. Add it to your .env file (see .env.example).',
    );
  }

  const environment = (process.env.SQUARE_ENVIRONMENT || 'sandbox') as
    | 'sandbox'
    | 'production';

  const baseUrl =
    environment === 'production'
      ? 'https://connect.squareup.com/v2'
      : 'https://connect.squareupsandbox.com/v2';

  return {
    PORT: Number(process.env.PORT) || 4000,
    SQUARE_ACCESS_TOKEN: token,
    SQUARE_ENVIRONMENT: environment,
    SQUARE_BASE_URL: baseUrl,
    CACHE_TTL_SECONDS: Number(process.env.CACHE_TTL_SECONDS) || 300,
    NODE_ENV: process.env.NODE_ENV || 'development',
  };
}

export const env = validateAndBuildConfig();
