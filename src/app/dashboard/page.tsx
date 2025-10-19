'use client'

import { useUser, SignOutButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { GraduationCap, DollarSign, Calendar, User, QrCode, ChevronDown, ChevronUp, Wallet } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import QRCodeComponent from '@/components/qr-code'

interface OnboardingData {
  id: string
  university_name: string
  tuition_amount: number
  admin_fee: number
  total_amount: number
  payment_plan: string
  stripe_subscription_id: string
  status: string
  first_name: string
  last_name: string
  email: string
  created_at: string
}

interface Installment {
  id: string
  installment_number: number
  amount: number
  due_date: string
  status: string
  paid_at: string | null
  created_at: string
}

interface Payment {
  id: string
  amount: number
  status: string
  payment_type: string
  due_date: string
  created_at: string
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [qrUrl, setQrUrl] = useState('')
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null)
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null)
  const [installments, setInstallments] = useState<Installment[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [showAllInstallments, setShowAllInstallments] = useState(false)

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/')
    }
  }, [isLoaded, user, router])

  useEffect(() => {
    // Set QR URL after component mounts
    setQrUrl(`${window.location.origin}/qr`)
  }, [])

  // Check onboarding status and fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (isLoaded && user) {
        try {
          setLoading(true)
          
          // Fetch onboarding status and data
          const statusResponse = await fetch('/api/onboarding/status')
          const statusData = await statusResponse.json()
          
          setOnboardingCompleted(statusData.onboardingCompleted)
          
          if (statusData.onboardingCompleted && statusData.onboardingId) {
            // Fetch detailed onboarding data
            const onboardingResponse = await fetch(`/api/onboarding/data?id=${statusData.onboardingId}`)
            const onboardingData = await onboardingResponse.json()
            
            if (onboardingData.success) {
              setOnboardingData(onboardingData.data)
              
              // Fetch installments
              const installmentsResponse = await fetch(`/api/installments?onboardingId=${statusData.onboardingId}`)
              const installmentsData = await installmentsResponse.json()
              
              if (installmentsData.success) {
                setInstallments(installmentsData.data)
              }

              // Fetch payments for balance calculation
              const paymentsResponse = await fetch('/api/payments')
              const paymentsData = await paymentsResponse.json()
              
              if (paymentsData.success) {
                setPayments(paymentsData.data)
              }
            }
          } else {
            // Redirect to onboarding if not completed
            router.push('/onboarding')
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          // If there's an error, assume onboarding is not completed
          setOnboardingCompleted(false)
          router.push('/onboarding')
        } finally {
          setLoading(false)
        }
      }
    }

    fetchUserData()
  }, [isLoaded, user, router])

  // Calculate balance information
  const calculateBalanceInfo = () => {
    if (!onboardingData || !payments.length) {
      return {
        totalAmount: 0,
        paidAmount: 0,
        remainingAmount: 0,
        progressPercentage: 0,
        totalPayments: 0,
        completedPayments: 0
      }
    }

    const totalAmount = onboardingData.total_amount || 0
    const paidAmount = payments
      .filter(payment => payment.status === 'succeeded')
      .reduce((sum, payment) => sum + payment.amount, 0)
    
    const remainingAmount = totalAmount - paidAmount
    const progressPercentage = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0
    
    const totalPayments = payments.length
    const completedPayments = payments.filter(payment => payment.status === 'succeeded').length

    return {
      totalAmount,
      paidAmount,
      remainingAmount,
      progressPercentage,
      totalPayments,
      completedPayments
    }
  }

  const balanceInfo = calculateBalanceInfo()

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f6f7' }}>
      {/* Header */}
      <header className="border-b border-gray-300 shadow-sm" style={{ backgroundColor: '#f5f6f7' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Installo Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.firstName || user.emailAddresses[0]?.emailAddress}
              </span>
              <SignOutButton>
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:text-gray-700 hover:bg-gray-100">
                  Sign Out
                </Button>
              </SignOutButton>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Profile Card */}
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900">Profile</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong className="text-gray-900">Email:</strong> {onboardingData?.email || user.emailAddresses[0]?.emailAddress}
                  </p>
                </div>
                <div className="p-3 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong className="text-gray-900">Name:</strong> {onboardingData?.first_name || user.firstName} {onboardingData?.last_name || user.lastName}
                  </p>
                </div>
                <div className="p-3 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong className="text-gray-900">University:</strong> {onboardingData?.university_name || 'Not specified'}
                  </p>
                </div>
                <Badge className="bg-green-600 text-white border-green-600">
                  {onboardingData?.status === 'active' ? 'Active Student' : 'Student Account'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Payment Plan Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <CardTitle>Payment Plan</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong className="text-gray-900">Plan:</strong> {onboardingData?.payment_plan ? onboardingData.payment_plan.charAt(0).toUpperCase() + onboardingData.payment_plan.slice(1) : 'Not specified'}
                  </p>
                </div>
                
                {/* Transparent Fee Breakdown */}
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900 mb-2">Payment Breakdown</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tuition Amount:</span>
                      <span className="font-medium">${onboardingData?.tuition_amount?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Admin Fee:</span>
                      <span className="font-medium">${onboardingData?.admin_fee?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="border-t border-blue-300 pt-1 mt-1">
                      <div className="flex justify-between text-sm font-semibold">
                        <span className="text-blue-900">Total Amount:</span>
                        <span className="text-blue-900">${onboardingData?.total_amount?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong className="text-gray-900">Subscription ID:</strong> {onboardingData?.stripe_subscription_id ? onboardingData.stripe_subscription_id.slice(-8) : 'Not available'}
                  </p>
                </div>
                
                <Badge variant="outline" className={onboardingData?.status === 'active' ? 'border-green-500 text-green-600' : 'border-gray-300'}>
                  {onboardingData?.status === 'active' ? 'Active' : onboardingData?.status || 'Pending'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Next Payment Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <CardTitle>Next Payment</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(() => {
                  const nextPayment = installments.find(inst => inst.status === 'pending')
                  if (nextPayment) {
                    return (
                      <>
                        <p className="text-sm text-gray-600">
                          <strong>Due Date:</strong> {new Date(nextPayment.due_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Amount:</strong> ${nextPayment.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Payment #:</strong> {nextPayment.installment_number}
                        </p>
                        <Button size="sm" className="w-full">
                          Pay Now
                        </Button>
                      </>
                    )
                  } else {
                    return (
                      <>
                        <p className="text-sm text-gray-600">
                          <strong>Status:</strong> All payments completed
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Total Paid:</strong> ${installments.filter(inst => inst.status === 'paid').reduce((sum, inst) => sum + inst.amount, 0).toFixed(2)}
                        </p>
                        <Badge className="bg-green-600 text-white">Complete</Badge>
                      </>
                    )
                  }
                })()}
              </div>
            </CardContent>
          </Card>

          {/* Remaining Balance Card */}
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900">Remaining Balance</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Payment Progress</span>
                    <span>{balanceInfo.completedPayments}/{balanceInfo.totalPayments} payments</span>
                  </div>
                  <Progress 
                    value={balanceInfo.progressPercentage} 
                    className="h-2"
                  />
                  <div className="text-center text-xs text-gray-500">
                    {balanceInfo.progressPercentage.toFixed(1)}% Complete
                  </div>
                </div>

                {/* Balance Breakdown */}
                <div className="space-y-3">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Total Amount:</span>
                      <span className="font-semibold text-gray-900">${balanceInfo.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-green-700">Amount Paid:</span>
                      <span className="font-semibold text-green-800">${balanceInfo.paidAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-orange-700">Remaining Balance:</span>
                      <span className="font-semibold text-orange-800">${balanceInfo.remainingAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="text-center">
                  {balanceInfo.remainingAmount <= 0 ? (
                    <Badge className="bg-green-600 text-white border-green-600">
                      Payment Complete
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-orange-500 text-orange-600">
                      {balanceInfo.totalPayments - balanceInfo.completedPayments} Payments Remaining
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* QR Code Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-green-600" />
                <CardTitle>Share Access</CardTitle>
              </div>
              <CardDescription>
                Share this QR code with others to give them access to Installo onboarding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                {qrUrl && (
                  <QRCodeComponent 
                    url={qrUrl}
                    title="Installo Access QR Code"
                    description="Scan to access Installo onboarding (login required)"
                    size={200}
                    logoSize={50}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your recent payment history and account activity
                </CardDescription>
              </div>
              {installments.length > 5 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllInstallments(!showAllInstallments)}
                  className="flex items-center space-x-1"
                >
                  <span>{showAllInstallments ? 'Show Less' : 'See More'}</span>
                  {showAllInstallments ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {installments.length > 0 ? (
                installments
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .slice(0, showAllInstallments ? installments.length : 5)
                  .map((installment) => (
                    <div key={installment.id} className={`flex items-center justify-between p-4 rounded-lg ${
                      installment.status === 'paid' ? 'bg-green-50' : 
                      installment.status === 'failed' ? 'bg-red-50' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          installment.status === 'paid' ? 'bg-green-500' : 
                          installment.status === 'failed' ? 'bg-red-500' : 'bg-gray-400'
                        }`}></div>
                        <div>
                          <p className="font-medium">
                            Payment #{installment.installment_number} - {installment.status === 'paid' ? 'Successful' : 
                            installment.status === 'failed' ? 'Failed' : 'Pending'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {installment.status === 'paid' && installment.paid_at 
                              ? new Date(installment.paid_at).toLocaleDateString()
                              : new Date(installment.due_date).toLocaleDateString()
                            }
                          </p>
                        </div>
                      </div>
                      <span className={`font-semibold ${
                        installment.status === 'paid' ? 'text-green-600' : 
                        installment.status === 'failed' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        ${installment.amount.toFixed(2)}
                      </span>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No payment history available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
