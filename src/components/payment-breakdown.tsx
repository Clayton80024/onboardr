'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, CreditCard, DollarSign, Info } from 'lucide-react'

interface PaymentBreakdownProps {
  tuitionAmount: number
  paymentPlan: string
  universityName: string
}

export function PaymentBreakdown({ tuitionAmount, paymentPlan, universityName }: PaymentBreakdownProps) {
  const paymentPlans = {
    basic: { 
      feePercentage: 0.055, 
      totalPayments: 5, 
      remainingPayments: 4,
      name: 'Basic Plan',
      color: 'bg-blue-100 text-blue-800'
    },
    premium: { 
      feePercentage: 0.065, 
      totalPayments: 7, 
      remainingPayments: 6,
      name: 'Premium Plan',
      color: 'bg-purple-100 text-purple-800'
    },
    flexible: { 
      feePercentage: 0.08, 
      totalPayments: 9, 
      remainingPayments: 8,
      name: 'Flexible Plan',
      color: 'bg-green-100 text-green-800'
    }
  }

  const plan = paymentPlans[paymentPlan as keyof typeof paymentPlans]
  if (!plan) return null

  const adminFee = tuitionAmount * plan.feePercentage
  const totalAmount = tuitionAmount + adminFee
  const paymentAmount = totalAmount / plan.totalPayments

  // Calculate next payment dates
  const today = new Date()
  const nextPaymentDate = new Date(today)
  nextPaymentDate.setMonth(today.getMonth() + 1)

  return (
    <div className="space-y-6">
      {/* Payment Plan Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Plan Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Plan Selected</span>
            <Badge className={plan.color}>
              {plan.name} ({plan.totalPayments} payments)
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">University</span>
            <span className="font-medium">{universityName}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Base Tuition</span>
            <span className="font-medium">${tuitionAmount.toLocaleString()}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Admin Fee ({(plan.feePercentage * 100)}%)</span>
            <span className="font-medium">${adminFee.toFixed(2)}</span>
          </div>
          
          <div className="border-t pt-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Total Amount</span>
              <span className="font-bold text-lg">${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Payment Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Today's Payment */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-blue-900">Today&apos;s Payment</span>
              </div>
              <Badge variant="default" className="bg-blue-600">
                Installment 1 of {plan.totalPayments}
              </Badge>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              ${paymentAmount.toFixed(2)}
            </div>
            <div className="text-sm text-blue-700">
              This payment will be charged immediately
            </div>
          </div>

          {/* Monthly Payments */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-600" />
                <span className="font-semibold text-gray-900">Monthly Payments</span>
              </div>
              <Badge variant="outline">
                {plan.remainingPayments} payments
              </Badge>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ${paymentAmount.toFixed(2)}
            </div>
            <div className="text-sm text-gray-700">
              Each month for {plan.remainingPayments} months
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Next payment: {nextPaymentDate.toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Information */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <Info className="h-5 w-5" />
            Important Information
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-amber-800 space-y-2">
          <p>
            • <strong>Today&apos;s Payment:</strong> You&apos;ll be charged ${paymentAmount.toFixed(2)} immediately
          </p>
          <p>
            • <strong>Monthly Payments:</strong> ${paymentAmount.toFixed(2)} will be automatically charged each month for {plan.remainingPayments} months
          </p>
          <p>
            • <strong>Total Amount:</strong> ${totalAmount.toFixed(2)} paid over {plan.totalPayments} installments
          </p>
          <p>
            • <strong>Payment Method:</strong> Your card will be saved for automatic monthly payments
          </p>
          <p>
            • <strong>Cancellation:</strong> You can cancel your payment plan at any time through your dashboard
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

