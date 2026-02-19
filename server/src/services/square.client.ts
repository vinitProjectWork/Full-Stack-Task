import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { env } from '../config/env.js';
import { SquareApiError } from '../utils/errors.js';

/**
 * Pre-configured Axios instance for all Square API requests.
 * - Sets auth header and API version
 * - Maps Square error responses to our `SquareApiError`
 */
function createSquareClient(): AxiosInstance {
  const client = axios.create({
    baseURL: env.SQUARE_BASE_URL,
    headers: {
      Authorization: `Bearer ${env.SQUARE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'Square-Version': '2024-12-18',
    },
    timeout: 15_000,
  });

  // Intercept errors and convert to SquareApiError
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError<{ errors?: Array<{ code: string; detail: string }> }>) => {
      const status = error.response?.status ?? 502;
      const squareErrors = error.response?.data?.errors;

      if (squareErrors?.length) {
        const first = squareErrors[0];
        throw new SquareApiError(status, `Square: ${first.code}`, first.detail);
      }

      throw new SquareApiError(
        status,
        error.message || 'Failed to communicate with Square API',
      );
    },
  );

  return client;
}

export const squareClient = createSquareClient();
