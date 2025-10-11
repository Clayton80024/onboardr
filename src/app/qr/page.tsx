'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function QRCodeRedirectPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded) return

    if (user) {
      // User is authenticated, redirect to onboarding
      router.push('/onboarding')
    } else {
      // User is not authenticated, redirect to sign-in
      router.push('/sign-in')
    }
  }, [isLoaded, user, router])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f5f6f7' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}


