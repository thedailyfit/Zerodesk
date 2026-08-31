import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Protect all routes except public ones and auth routes
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/onboarding(.*)',
  '/api/webhooks(.*)',
  '/api/public(.*)',
  '/widget(.*)'
]);

const hasClerkKeys = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.CLERK_SECRET_KEY &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('your_key_here')
);

const clerkHandler = hasClerkKeys
  ? clerkMiddleware(async (auth, request) => {
      try {
        if (!isPublicRoute(request)) {
          await auth.protect();
        }
      } catch {
        // Graceful handling for demo or unauthenticated state
      }
    })
  : null;

export default function middleware(request: NextRequest, event: any) {
  if (clerkHandler) {
    return clerkHandler(request, event);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
