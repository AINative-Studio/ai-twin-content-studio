/**
 * Server-side AINative client — use in Server Components and Route Handlers.
 * Wraps @ainative/next-sdk createServerClient.
 */
import { createServerClient } from '@ainative/next-sdk/server';

export function getServerClient() {
  return createServerClient({
    apiKey: process.env.AINATIVE_API_KEY!,
    baseUrl: process.env.AINATIVE_API_URL ?? 'https://api.ainative.studio/api/v1/public',
  });
}

export const AINATIVE_BASE =
  process.env.AINATIVE_API_URL ?? 'https://api.ainative.studio/api/v1/public';
