import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware({
  publicRoutes: ['/', '/sign-in(.*)', '/sign-up(.*)', '/qr'],
  ignoredRoutes: ['/api/webhooks/stripe'],
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
