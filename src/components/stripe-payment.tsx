'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, Loader2, AlertCircle } from 'lucide-react'
import type { UserResource } from '@clerk/types'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentFormProps {
  tuitionAmount: string
  paymentPlan: string
  formData: Record<string, unknown>
  user: UserResource | null
  onSuccess: (paymentIntentId: string) => void
  onError: (error: string) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

function PaymentForm({ 
  tuitionAmount, 
  paymentPlan, 
  formData,
  user,
  onSuccess, 
  onError, 
  isLoading, 
  setIsLoading 
}: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [cardError, setCardError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)
    setCardError(null)

    const cardElement = elements.getElement(CardElement)

    if (!cardElement) {
      setCardError('Card element not found')
      setIsLoading(false)
      return
    }

    try {
      // Create payment method
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      })

      if (pmError) {
        setCardError(pmError.message || 'Payment method creation failed')
        setIsLoading(false)
        return
      }

      if (!paymentMethod) {
        setCardError('Failed to create payment method')
        setIsLoading(false)
        return
      }

      // Create hybrid payment system (Card + ACH) via Supabase Edge Function
      const response = await fetch('https://gdhgsmccaqycmvxxoaif.supabase.co/functions/v1/create-hybrid-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          tuitionAmount,
          paymentPlan,
          universityName: formData.university,
          studentId: formData.studentId,
          studentEmail: formData.studentEmail,
          userId: user?.id,
          firstName: formData.firstName || user?.firstName || '',
          lastName: formData.lastName || user?.lastName || '',
          // Always use Clerk sign-up email (primary email from authentication)
          email: user?.emailAddresses[0]?.emailAddress || formData.email || '',
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
          emergencyContactName: formData.emergencyContactName,
          emergencyContactPhone: formData.emergencyContactPhone,
          emergencyContactRelationship: formData.emergencyContactRelationship,
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          routingNumber: formData.routingNumber,
          accountType: formData.accountType
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create hybrid payment system')
      }

      // For hybrid payments, the first payment is automatically processed
      // Remaining payments will be handled via ACH payment links
      setIsLoading(false) // Clear loading state
      onSuccess(result.upfrontPaymentIntentId)
    } catch (error) {
      console.error('Payment error:', error)
      onError(error instanceof Error ? error.message : 'Payment failed')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Information
          </label>
          <div className="p-4 border border-gray-300 rounded-lg bg-white">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
                hidePostalCode: false, // Show zipcode field
              }}
            />
          </div>
          {cardError && (
            <div className="flex items-center mt-2 text-red-600">
              <AlertCircle className="w-4 h-4 mr-1" />
              <span className="text-sm">{cardError}</span>
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Payment Summary</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Tuition Amount:</span>
              <span>${parseFloat(tuitionAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Installment Plan:</span>
              <span>{getPlanDisplayName(paymentPlan)}</span>
            </div>
            <div className="flex justify-between font-medium text-gray-900 border-t pt-1">
              <span>First Payment:</span>
              <span>${calculateFirstPayment(tuitionAmount, paymentPlan).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || isLoading}
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Complete Payment
          </>
        )}
      </Button>
    </form>
  )
}

function getPlanDisplayName(planId: string) {
  const planNames = {
    basic: 'Fast track',
    premium: 'Most popular',
    flexible: 'Flexible'
  }
  return planNames[planId as keyof typeof planNames] || planId
}

function calculateFirstPayment(tuitionAmount: string, paymentPlan: string) {
  const paymentPlans = {
    basic: { feePercentage: 0.055, totalPayments: 5 }, // 5.5% fee
    premium: { feePercentage: 0.065, totalPayments: 7 }, // 6.5% fee
    flexible: { feePercentage: 0.08, totalPayments: 9 } // 8% fee
  }

  const plan = paymentPlans[paymentPlan as keyof typeof paymentPlans]
  if (!plan) return 0

  const tuitionAmountNum = parseFloat(tuitionAmount)
  const adminFeeAmount = tuitionAmountNum * plan.feePercentage
  const totalAmount = tuitionAmountNum + adminFeeAmount
  return totalAmount / plan.totalPayments
}

interface StripePaymentProps {
  tuitionAmount: string
  paymentPlan: string
  formData: Record<string, unknown>
  user: UserResource | null
  onSuccess: (subscriptionId: string) => void
  onError: (error: string) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export default function StripePayment({
  tuitionAmount,
  paymentPlan,
  formData,
  user,
  onSuccess,
  onError,
  isLoading,
  setIsLoading
}: StripePaymentProps) {
  return (
    <Elements stripe={stripePromise}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-6 h-6 mr-2" />
            Payment Information
          </CardTitle>
          <CardDescription>
            Complete your payment to start your hybrid installment plan. Your card will be charged ${calculateFirstPayment(tuitionAmount, paymentPlan).toFixed(2)} today, then you&apos;ll receive ACH payment links for your remaining installments (lower fees!).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentForm
            tuitionAmount={tuitionAmount}
            paymentPlan={paymentPlan}
            formData={formData}
            user={user}
            onSuccess={onSuccess}
            onError={onError}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        </CardContent>
      </Card>
    </Elements>
  )
}
