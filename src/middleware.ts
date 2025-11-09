import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/qr',
  '/api/webhooks(.*)',
  '/api/test(.*)',
  '/api/env-check(.*)',
  '/api/supabase-test(.*)',
  '/api/test-hybrid(.*)',
  '/api/debug-onboarding(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
