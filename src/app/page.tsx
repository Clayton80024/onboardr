'use client'

import { SignInButton, SignUpButton, useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GraduationCap, DollarSign, Shield, Clock, Users, CheckCircle, Star, Globe, CreditCard, ArrowRight, QrCode } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import QRCodeComponent from '@/components/qr-code'

export default function HomePage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [isDevMode, setIsDevMode] = useState(false)
  const [qrUrl, setQrUrl] = useState('')

  useEffect(() => {
    const isDev = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('placeholder') ?? false
    setIsDevMode(isDev)
    
    if (isLoaded && user && !isDev) {
      router.push('/onboarding')
    }
  }, [isLoaded, user, router])

  useEffect(() => {
    // Set QR URL after component mounts
    setQrUrl(`${window.location.origin}/qr`)
  }, [])

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (user && !isDevMode) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to onboarding...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <img 
                src="/logo-installo.png" 
                alt="Installo Logo" 
                className="w-8 h-8 object-contain"
              />
              <h1 className="text-2xl font-bold text-white">Installo</h1>
            </div>
            <div className="flex items-center space-x-4">
              <SignInButton mode="modal">
                <Button variant="ghost" className="text-gray-300 hover:text-gray-300">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  Get Started
                </Button>
              </SignUpButton>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {isDevMode && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-2xl mx-auto">
              <p className="text-sm text-yellow-800">
                <strong>Development Mode:</strong> Add your API keys to .env.local to enable authentication and payments
              </p>
            </div>
          )}
          
          <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-200">
            🎓 Split My Tuition
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Split your tuition
            <br />
            <span className="text-green-400">
              into manageable payments
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Pay part of your tuition upfront and the rest later in the semester. 
            We work directly with your university to offer flexible payment management. 
            No credit check required for international students.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-full border border-gray-700">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-sm font-medium text-white">No Credit Check</span>
            </div>
            <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-full border border-gray-700">
              <Clock className="w-5 h-5 text-green-400" />
              <span className="text-sm font-medium text-white">Flexible Payment Management</span>
            </div>
            <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-full border border-gray-700">
              <Globe className="w-5 h-5 text-green-400" />
              <span className="text-sm font-medium text-white">University Partnership</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isDevMode ? (
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-4"
                onClick={() => router.push('/onboarding')}
              >
                View Demo (No Auth Required)
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            ) : (
              <SignUpButton mode="modal">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-4"
                >
                  Split My Tuition
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </SignUpButton>
            )}
          </div>

          {/* QR Code Section */}
          <div className="mt-8 flex flex-col items-center">
            <div className="flex items-center space-x-2 mb-4">
              <QrCode className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-400">Or scan to get started on mobile</span>
            </div>
            {qrUrl && (
              <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
                <QRCodeComponent 
                  url={qrUrl}
                  title=""
                  description=""
                  size={150}
                  logoSize={40}
                />
              </div>
            )}
          </div>

          <p className="text-sm text-gray-400 mt-6">
            Trusted by 50,000+ international students • 
            <a href="/fees" className="text-green-400 hover:text-green-300 underline ml-1">
              View transparent pricing
            </a>
          </p>
        </div>
      </section>

      {/* Universities Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How tuition payment management works
            </h2>
            <p className="text-xl text-gray-600">
              Simple, flexible payment management designed for international students
            </p>
          </div>
          
          {/* Three Mobile Mockups */}
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* Mockup 1: Choose School */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-72 h-[580px] bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative">
                    {/* Status Bar */}
                    <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-b">
                      <div className="text-xs font-semibold text-gray-900">9:41</div>
                      <div className="w-3 h-1.5 bg-green-500 rounded-sm"></div>
                    </div>
                    
                    {/* App Content */}
                    <div className="p-4 h-full overflow-y-auto">
                      {/* Header */}
                      <div className="text-center mb-6">
                        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                          <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 mb-1">Step 1</h3>
                        <p className="text-sm text-gray-600">Choose Your University</p>
                      </div>

                      {/* University Selection */}
                      <div className="space-y-3">
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 flex items-center justify-center">
                              <img 
                                src="/harvard_logo.png" 
                                alt="Harvard University" 
                                className="w-6 h-6 object-contain"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">Harvard University</p>
                              <p className="text-xs text-gray-600">Cambridge, MA</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 flex items-center justify-center">
                              <img 
                                src="/MIT_logo.svg" 
                                alt="MIT" 
                                className="w-6 h-6 object-contain"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">MIT</p>
                              <p className="text-xs text-gray-600">Cambridge, MA</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 flex items-center justify-center">
                              <img 
                                src="/stanford_logo.avif" 
                                alt="Stanford University" 
                                className="w-6 h-6 object-contain"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">Stanford University</p>
                              <p className="text-xs text-gray-600">Stanford, CA</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Continue Button */}
                      <div className="mt-6">
                        <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg text-sm">
                          Continue
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Element */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            {/* Mockup 2: Select Plan */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-72 h-[580px] bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative">
                    {/* Status Bar */}
                    <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-b">
                      <div className="text-xs font-semibold text-gray-900">9:41</div>
                      <div className="w-3 h-1.5 bg-green-500 rounded-sm"></div>
                    </div>
                    
                    {/* App Content */}
                    <div className="p-4 h-full overflow-y-auto">
                      {/* Header */}
                      <div className="text-center mb-4">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                          <CreditCard className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 mb-1">Step 2</h3>
                        <p className="text-xs text-gray-600">Select Your Payment Schedule</p>
                      </div>

                      {/* Payment Plans */}
                      <div className="space-y-2">
                        <div className="bg-green-50 rounded-lg p-2 border-2 border-green-500">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-xs font-semibold text-gray-900">2-Payment Schedule</h4>
                            <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-2 h-2 text-white" />
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 mb-1">50% upfront, 50% later</p>
                          <p className="text-xs font-bold text-green-600">$6,000 per payment</p>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-xs font-semibold text-gray-900">3-Payment Schedule</h4>
                            <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                          </div>
                          <p className="text-xs text-gray-600 mb-1">40% upfront, 30% + 30% later</p>
                          <p className="text-xs font-bold text-gray-600">$4,000 per payment</p>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-xs font-semibold text-gray-900">4-Payment Schedule</h4>
                            <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                          </div>
                          <p className="text-xs text-gray-600 mb-1">40% upfront, 20% + 20% + 20% later</p>
                          <p className="text-xs font-bold text-gray-600">$3,000 per payment</p>
                        </div>
                      </div>

                      {/* Continue Button */}
                      <div className="mt-4">
                        <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg text-sm">
                          Continue
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Element */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            {/* Mockup 3: Pay On Time */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-72 h-[580px] bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative">
                    {/* Status Bar */}
                    <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-b">
                      <div className="text-xs font-semibold text-gray-900">9:41</div>
                      <div className="w-3 h-1.5 bg-green-500 rounded-sm"></div>
                    </div>
                    
                    {/* App Content */}
                    <div className="p-4 h-full overflow-y-auto">
                      {/* Header */}
                      <div className="text-center mb-6">
                        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                          <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 mb-1">Step 3</h3>
                        <p className="text-sm text-gray-600">Complete Your Payment</p>
                      </div>

                      {/* Payment Summary */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="text-center">
                          <p className="text-xs text-gray-600 mb-2">Total Tuition</p>
                          <p className="text-2xl font-bold text-gray-900 mb-4">$12,000</p>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Initial Payment</span>
                              <span className="text-sm font-semibold text-green-600">$6,000</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Remaining Payment</span>
                              <span className="text-sm font-semibold text-gray-900">$6,000</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Payment Method */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Credit Card</p>
                            <p className="text-xs text-gray-600">•••• 4242</p>
                          </div>
                        </div>
                      </div>

                      {/* Pay Button */}
                      <div className="mt-6">
                        <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg text-sm">
                          Pay $6,000 Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Element */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-gradient-to-r from-green-100 to-blue-100 text-green-800 border-green-200">
              ⭐ Student Reviews
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What students are saying
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real experiences from international students who manage their tuition payments with Installo
            </p>
          </div>

          {/* Desktop Grid */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-xl bg-white hover:shadow-2xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-green-600 font-bold text-xl">A</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Aisha from Nigeria 🇳🇬</h3>
                    <p className="text-sm text-gray-600">NYU • Computer Science</p>
                  </div>
                </div>
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  &quot;Installo made it possible for me to manage my tuition payments without stressing about having all the money upfront. The flexible payment management saved my semester!&quot;
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white hover:shadow-2xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-bold text-xl">R</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Raj from India 🇮🇳</h3>
                    <p className="text-sm text-gray-600">MIT • Engineering</p>
                  </div>
                </div>
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  &quot;As an international student, I was worried about credit checks. Installo&apos;s no-credit-check policy was exactly what I needed.&quot;
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white hover:shadow-2xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-purple-600 font-bold text-xl">M</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Maria from Brazil 🇧🇷</h3>
                    <p className="text-sm text-gray-600">Stanford • Business</p>
                  </div>
                </div>
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  &quot;The process was so simple and the customer service team was incredibly helpful. I recommend Installo to all my international friends.&quot;
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Mobile Horizontal Scroll */}
          <div className="lg:hidden">
            <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide">
              <div className="flex-shrink-0 w-80">
                <Card className="border-0 shadow-xl bg-white h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-green-600 font-bold">A</span>
                      </div>
                      <div>
                        <h3 className="font-semibold">Aisha from Nigeria 🇳🇬</h3>
                        <p className="text-sm text-gray-600">NYU • Computer Science</p>
                      </div>
                    </div>
                    <div className="flex text-yellow-400 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      &quot;Installo made it possible for me to manage my tuition payments without stressing about having all the money upfront. The flexible payment management saved my semester!&quot;
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex-shrink-0 w-80">
                <Card className="border-0 shadow-xl bg-white h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-bold">R</span>
                      </div>
                      <div>
                        <h3 className="font-semibold">Raj from India 🇮🇳</h3>
                        <p className="text-sm text-gray-600">MIT • Engineering</p>
                      </div>
                    </div>
                    <div className="flex text-yellow-400 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      &quot;As an international student, I was worried about credit checks. Installo&apos;s no-credit-check policy was exactly what I needed.&quot;
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex-shrink-0 w-80">
                <Card className="border-0 shadow-xl bg-white h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-purple-600 font-bold">M</span>
                      </div>
                      <div>
                        <h3 className="font-semibold">Maria from Brazil 🇧🇷</h3>
                        <p className="text-sm text-gray-600">Stanford • Business</p>
                      </div>
                    </div>
                    <div className="flex text-yellow-400 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      &quot;The process was so simple and the customer service team was incredibly helpful. I recommend Installo to all my international friends.&quot;
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex-shrink-0 w-80">
                <Card className="border-0 shadow-xl bg-white h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-100 to-red-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-orange-600 font-bold">C</span>
                      </div>
                      <div>
                        <h3 className="font-semibold">Chen from China 🇨🇳</h3>
                        <p className="text-sm text-gray-600">Harvard • Economics</p>
                      </div>
                    </div>
                    <div className="flex text-yellow-400 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      &quot;Installo&apos;s university partnership made everything seamless. I could focus on my studies instead of worrying about payment deadlines.&quot;
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex-shrink-0 w-80">
                <Card className="border-0 shadow-xl bg-white h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-teal-600 font-bold">S</span>
                      </div>
                      <div>
                        <h3 className="font-semibold">Sofia from Mexico 🇲🇽</h3>
                        <p className="text-sm text-gray-600">UCLA • Psychology</p>
                      </div>
                    </div>
                    <div className="flex text-yellow-400 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      &quot;The transparent fee structure gave me confidence. No surprises, just clear payment management that works.&quot;
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-16 text-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">50,000+</div>
                <div className="text-sm text-gray-600">Students Helped</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">4.9/5</div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">500+</div>
                <div className="text-sm text-gray-600">Universities</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600 mb-2">98%</div>
                <div className="text-sm text-gray-600">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to manage your tuition payments?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of international students who are managing their education payments more flexibly
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isDevMode ? (
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-4"
                onClick={() => router.push('/onboarding')}
              >
                View Demo
              </Button>
            ) : (
              <SignUpButton mode="modal">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-4"
                >
                  Get Started Today
                </Button>
              </SignUpButton>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <img 
                  src="/logo-installo.png" 
                  alt="Installo Logo" 
                  className="w-8 h-8 object-contain"
                />
                <span className="text-xl font-bold">Installo</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Helping international students manage their tuition payments with flexible payment management solutions, working directly with universities.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">How It Works</a></li>
                <li><a href="/fees" className="hover:text-white">Pricing & Fees</a></li>
                <li><a href="#" className="hover:text-white">Universities</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© 2024 Installo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}