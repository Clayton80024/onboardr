import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Installo - Student Tuition Payment Plans',
  description: 'Split your tuition payments into manageable installments. Flexible payment plans for international students with no credit check required.',
  keywords: 'tuition payment plans, student loans, installment payments, international students, university payments, flexible tuition, no credit check',
  authors: [{ name: 'Installo Team' }],
  creator: 'Installo',
  publisher: 'Installo',
  robots: 'index, follow',
  icons: {
    icon: '/favicon-16x16.png',
    shortcut: '/favicon-16x16.png',
    apple: '/favicon-16x16.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://installo.com',
    siteName: 'Installo',
    title: 'Installo - Student Tuition Payment Plans',
    description: 'Split your tuition payments into manageable installments. Flexible payment plans for international students with no credit check required.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Installo - Student Tuition Payment Plans',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Installo - Student Tuition Payment Plans',
    description: 'Split your tuition payments into manageable installments. Flexible payment plans for international students.',
    images: ['/og-image.jpg'],
    creator: '@installo',
  },
  manifest: '/manifest.json',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/onboarding"
      afterSignUpUrl="/onboarding"
    >
      <html lang="en">
        <body className={inter.className}>
          {/* Google tag (gtag.js) */}
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-0MNY63QR8V"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-0MNY63QR8V');
            `}
          </Script>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}