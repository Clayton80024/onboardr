'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { GraduationCap, DollarSign, CreditCard, CheckCircle, User, Search, Loader2, AlertCircle, Zap, Star, Sparkles, Rocket, Shield, Clock, Heart } from 'lucide-react'
import { University } from '@/lib/supabase'
import UniversityLogo from '@/components/university-logo'
import StripePayment from '@/components/stripe-payment'

const paymentPlans = [
  {
    id: 'basic',
    name: 'Fast track',
    description: '1+4 payments',
    feePercentage: 0.055, // 5.5% fee
    upfrontPayments: 1,
    remainingPayments: 4,
    totalPayments: 5,
    badge: 'Fast Track',
    icon: Zap,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
    textColor: 'text-green-700',
    iconBg: 'bg-green-600'
  },
  {
    id: 'premium',
    name: 'Most popular',
    description: '1+6 payments',
    feePercentage: 0.065, // 6.5% fee
    upfrontPayments: 1,
    remainingPayments: 6,
    totalPayments: 7,
    badge: 'Most Popular',
    icon: Star,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    textColor: 'text-blue-700',
    iconBg: 'bg-blue-600'
  },
  {
    id: 'flexible',
    name: 'Flexible',
    description: '1+8 payments',
    feePercentage: 0.08, // 8% fee
    upfrontPayments: 1,
    remainingPayments: 8,
    totalPayments: 9,
    badge: 'Best Value',
    icon: Heart,
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    textColor: 'text-purple-700',
    iconBg: 'bg-purple-600'
  }
]


export default function OnboardingPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [universities, setUniversities] = useState<University[]>([])
  const [filteredUniversities, setFilteredUniversities] = useState<University[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoadingUniversities, setIsLoadingUniversities] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    university: '',
    universityId: '',
    tuitionAmount: '',
    studentId: '',
    studentEmail: '',
    paymentPlan: '',
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    // Emergency Contact
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    // Banking Information
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    accountType: 'checking'
  })

  const totalSteps = 8
  const progress = (currentStep / totalSteps) * 100

  useEffect(() => {
    const isDev = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('placeholder')
    if (isLoaded && !user && !isDev) {
      router.push('/')
    }
  }, [isLoaded, user, router])

  // Check if user has already completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (isLoaded && user) {
        try {
          const response = await fetch('/api/onboarding/status')
          const data = await response.json()
          
          // If onboarding is completed, redirect to dashboard
          if (data.onboardingCompleted) {
            router.push('/dashboard')
          }
        } catch (error) {
          console.error('Error checking onboarding status:', error)
          // If there's an error, continue with onboarding
        }
      }
    }

    checkOnboardingStatus()
  }, [isLoaded, user, router])

  // Fetch universities on component mount
  useEffect(() => {
    const fetchUniversities = async () => {
      setIsLoadingUniversities(true)
      try {
        const response = await fetch('/api/universities')
        const data = await response.json()
        if (data.universities) {
          setUniversities(data.universities)
          setFilteredUniversities(data.universities)
        }
      } catch (error) {
        console.error('Error fetching universities:', error)
      } finally {
        setIsLoadingUniversities(false)
      }
    }

    fetchUniversities()
  }, [])

  // Filter universities based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUniversities(universities)
    } else {
      const filtered = universities.filter(university =>
        university.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (university.short_name && university.short_name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      setFilteredUniversities(filtered)
    }
  }, [searchQuery, universities])

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const isDev = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('placeholder')
  
  if (!user && !isDev) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting...</p>
        </div>
      </div>
    )
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handlePaymentSuccess = (paymentIntentId: string) => {
    setSubscriptionId(paymentIntentId)
    setPaymentError(null)
    // Move to next step after successful payment
    nextStep()
    
    // Auto-redirect to dashboard after a short delay to show success message
    setTimeout(() => {
      router.push('/dashboard')
    }, 3000)
  }

  const handlePaymentError = (error: string) => {
    setPaymentError(error)
    setIsProcessingPayment(false)
  }

  const calculateUpfrontPayment = (planId: string) => {
    const amount = parseFloat(formData.tuitionAmount) || 0
    const plan = paymentPlans.find(p => p.id === planId)
    
    if (!plan || amount === 0) {
      return 0
    }
    
    // Calculate total amount with fees
    const adminFee = amount * plan.feePercentage
    const totalAmount = amount + adminFee
    
    // First payment is total amount divided by total payments
    return totalAmount / plan.totalPayments
  }

  const calculateRemainingPayments = (planId: string) => {
    const amount = parseFloat(formData.tuitionAmount) || 0
    const plan = paymentPlans.find(p => p.id === planId)
    
    if (!plan || amount === 0) {
      return 0
    }
    
    // Calculate total amount with fees
    const adminFee = amount * plan.feePercentage
    const totalAmount = amount + adminFee
    
    // Remaining payments are the same as upfront payment
    return totalAmount / plan.totalPayments
  }

  const calculateTotalWithFees = () => {
    const amount = parseFloat(formData.tuitionAmount) || 0
    const plan = paymentPlans.find(p => p.id === formData.paymentPlan)
    if (!plan) return amount
    
    const adminFee = amount * plan.feePercentage
    return amount + adminFee
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="w-full max-w-2xl mx-auto border-0 shadow-lg bg-gray-800">
            <CardHeader className="text-center">
              <div className="mx-auto mb-6 w-20 h-20 bg-green-600 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold text-white mb-2">Welcome to Installo!</CardTitle>
              <CardDescription className="text-gray-300 text-lg">
                Let&apos;s get you started with your flexible tuition payment schedule
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-lg text-gray-300 mb-4">
                  {isDev ? (
                    <>You&apos;re in demo mode: <strong className="text-white">demo@installo.com</strong></>
                  ) : (
                    <>You&apos;re signed in as: <strong className="text-white">{user?.emailAddresses[0]?.emailAddress}</strong></>
                  )}
                </p>
                <p className="text-base text-gray-400">
                  Ready to begin your tuition payment journey?
                </p>
              </div>
              <div className="bg-gray-700 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-4 text-lg">What you&apos;ll need:</h3>
                <ul className="text-gray-300 text-base space-y-2">
                  <li>• University information</li>
                  <li>• Tuition amount</li>
                  <li>• Student ID and email</li>
                  <li>• Payment method</li>
                </ul>
              </div>
              <Button onClick={nextStep} className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-3">
                Get Started
              </Button>
            </CardContent>
          </Card>
        )

      case 2:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto mb-6 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold mb-2">Choose Your University</CardTitle>
              <CardDescription className="text-lg">
                Search and select the university you&apos;re attending
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search University</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Type to search universities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Select University</Label>
                <div className="max-h-60 overflow-y-auto border rounded-md">
                  {isLoadingUniversities ? (
                    <div className="p-4 text-center text-gray-500">
                      Loading universities...
                    </div>
                  ) : filteredUniversities.length > 0 ? (
                    <div className="space-y-1 p-2">
                      {filteredUniversities.map((university) => (
                        <div
                          key={university.id}
                          className={`p-3 rounded-md cursor-pointer transition-colors ${
                            formData.universityId === university.id
                              ? 'bg-green-100 border-2 border-green-500'
                              : 'hover:bg-gray-50 border-2 border-transparent'
                          }`}
                          onClick={() => {
                            handleInputChange('university', university.name)
                            handleInputChange('universityId', university.id)
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <UniversityLogo university={university} size="md" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {university.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {university.city}, {university.state}
                              </p>
                            </div>
                            {university.short_name && (
                              <Badge variant="outline" className="text-xs">
                                {university.short_name}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                     <div className="p-4 text-center text-gray-500">
                       No universities found matching &quot;{searchQuery}&quot;
                     </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={prevStep} className="flex-1">
                  Back
                </Button>
                <Button onClick={nextStep} className="flex-1" disabled={!formData.university}>
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      case 3:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto mb-6 w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-yellow-600" />
              </div>
              <CardTitle className="text-2xl font-bold mb-2">Tuition Information</CardTitle>
              <CardDescription className="text-lg">
                Enter your tuition details (up to $6,000)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tuitionAmount">Tuition Amount (USD)</Label>
                <Input
                  id="tuitionAmount"
                  type="number"
                  placeholder="0.00"
                  value={formData.tuitionAmount}
                  onChange={(e) => handleInputChange('tuitionAmount', e.target.value)}
                  max={6000}
                  min={0}
                />
                <p className="text-xs text-gray-500">Maximum: $6,000</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  placeholder="Enter your student ID"
                  value={formData.studentId}
                  onChange={(e) => handleInputChange('studentId', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentEmail">Student Email</Label>
                <Input
                  id="studentEmail"
                  type="email"
                  placeholder="student@university.edu"
                  value={formData.studentEmail}
                  onChange={(e) => handleInputChange('studentEmail', e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={prevStep} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={nextStep} 
                  className="flex-1" 
                  disabled={!formData.tuitionAmount || !formData.studentId || !formData.studentEmail || parseFloat(formData.tuitionAmount) > 6000}
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      case 4:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Choose Payment Plan</CardTitle>
              <CardDescription>
                Select your payment schedule
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {paymentPlans.map((plan) => {
                  const IconComponent = plan.icon
                  return (
                    <div
                      key={plan.id}
                      className={`relative group border-2 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg ${
                        formData.paymentPlan === plan.id
                          ? `${plan.borderColor} ${plan.bgColor} shadow-lg`
                          : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'
                      }`}
                      onClick={() => handleInputChange('paymentPlan', plan.id)}
                    >
                      {/* Badge */}
                      {plan.badge === 'Most Popular' && (
                        <div className="absolute -top-2 -right-2 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-lg">
                          ⭐ Popular
                        </div>
                      )}
                      {plan.badge === 'Fast Track' && (
                        <div className="absolute -top-2 -right-2 px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full shadow-lg">
                          ⚡ Fast
                        </div>
                      )}
                      {plan.badge === 'Best Value' && (
                        <div className="absolute -top-2 -right-2 px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full shadow-lg">
                          💙 Value
                        </div>
                      )}

                      <div className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {/* Icon */}
                            <div className={`p-3 rounded-xl ${plan.iconBg} shadow-md`}>
                              <IconComponent className="w-6 h-6 text-white" />
                            </div>
                            
                            <div>
                              <h3 className={`text-xl font-bold ${formData.paymentPlan === plan.id ? plan.textColor : 'text-gray-900'}`}>
                                {plan.name}
                              </h3>
                              <p className="text-gray-600 font-medium">{plan.description}</p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${
                              formData.paymentPlan === plan.id ? plan.textColor : 'text-gray-900'
                            }`}>
                              ${calculateUpfrontPayment(plan.id).toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-500 mb-1">
                              <span className="font-semibold text-green-600">Pay now</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              + {plan.remainingPayments} × ${calculateRemainingPayments(plan.id).toFixed(2)}
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-2 ${
                              formData.paymentPlan === plan.id 
                                ? `${plan.borderColor} bg-white shadow-md` 
                                : 'border-gray-300'
                            }`}>
                              {formData.paymentPlan === plan.id && (
                                <div className={`w-3 h-3 rounded-full ${plan.iconBg}`}></div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={prevStep} className="flex-1">
                  Back
                </Button>
                <Button onClick={nextStep} className="flex-1" disabled={!formData.paymentPlan}>
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      case 5:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto mb-6 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold mb-2">Review & Confirm</CardTitle>
              <CardDescription className="text-lg">
                Confirm your payment plan before proceeding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary Card */}
              <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">University:</span>
                  <span className="font-semibold">{formData.university}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tuition:</span>
                  <span className="font-semibold">${parseFloat(formData.tuitionAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Plan:</span>
                  <Badge variant="outline" className="font-semibold">
                    {paymentPlans.find(p => p.id === formData.paymentPlan)?.name}
                  </Badge>
                </div>
              </div>

              {/* Payment Breakdown */}
              <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                <h3 className="text-lg font-bold text-green-800 mb-4">Payment Schedule</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium">Pay Now:</span>
                    </div>
                    <span className="text-xl font-bold text-green-600">
                      ${calculateUpfrontPayment(formData.paymentPlan).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="font-medium">Then {paymentPlans.find(p => p.id === formData.paymentPlan)?.remainingPayments} payments:</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-700">
                      ${calculateRemainingPayments(formData.paymentPlan).toFixed(2)} each
                    </span>
                  </div>
                  <div className="border-t border-green-300 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-green-800">Total:</span>
                      <span className="text-xl font-bold text-green-800">
                        ${calculateTotalWithFees().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={prevStep} className="flex-1">
                  Back
                </Button>
                <Button onClick={nextStep} className="flex-1 bg-green-600 hover:bg-green-700">
                  Proceed to Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      case 6:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto mb-6 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold mb-2">Personal Information</CardTitle>
              <CardDescription className="text-lg">
                Please provide your personal details for account setup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  placeholder="(555) 123-4567"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="123 Main Street"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="Boston"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="MA"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    placeholder="02101"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <Button variant="outline" onClick={prevStep} className="flex-1">
                  Back
                </Button>
                <Button onClick={nextStep} className="flex-1" disabled={!formData.firstName || !formData.lastName}>
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      case 7:
        return (
          <div className="w-full max-w-2xl mx-auto">
            {/* Stripe Payment Form */}
            <StripePayment
              tuitionAmount={formData.tuitionAmount}
              paymentPlan={formData.paymentPlan}
              formData={formData}
              user={user}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              isLoading={isProcessingPayment}
              setIsLoading={setIsProcessingPayment}
            />
            
            {paymentError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <p className="text-sm text-red-600">{paymentError}</p>
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-2">
              <Button variant="outline" onClick={prevStep} className="flex-1">
                Back
              </Button>
            </div>
          </div>
        )

      case 8:
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto mb-6 w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <CardTitle className="text-3xl font-bold mb-2">Payment Successful!</CardTitle>
              <CardDescription className="text-lg">
                Your payment plan has been activated
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold text-green-600">
                  Welcome to Installo!
                </p>
                <p className="text-sm text-gray-600">
                  Your payment has been processed successfully via Stripe.
                </p>
                {subscriptionId && (
                  <p className="text-xs text-gray-500">
                    Subscription ID: {subscriptionId}
                  </p>
                )}
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Payment Setup Complete</h4>
                <div className="space-y-1 text-sm text-green-700">
                  <p>✅ Payment processed via Stripe</p>
                  <p>✅ Subscription created successfully</p>
                  <p>✅ Automatic monthly payments enabled</p>
                  <p>✅ Secure payment processing activated</p>
                </div>
              </div>
              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  onClick={() => router.push('/dashboard')}
                >
                  Go to Dashboard
                </Button>
                <Button variant="outline" className="w-full">
                  Download App
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="w-full max-w-2xl mx-auto p-4">
        {/* Demo Mode Notice */}
        {isDev && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Demo Mode:</strong> This is a preview of the onboarding flow. Add your API keys to enable full functionality.
            </p>
          </div>
        )}
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-300">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-gray-400">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2 bg-gray-700" />
        </div>

        {/* Step Content */}
        {renderStep()}
      </div>
    </div>
  )
}
