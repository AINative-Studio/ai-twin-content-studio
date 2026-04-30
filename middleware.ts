/**
 * Auth middleware — withAuth from @ainative/next-sdk protects all /studio/* routes.
 * Unauthenticated requests redirect to /login.
 */
import { withAuth } from '@ainative/next-sdk/server';

export default withAuth({
  redirectTo: '/login',
});

export const config = {
  matcher: ['/studio/:path*'],
};
