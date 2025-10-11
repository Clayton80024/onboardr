'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GraduationCap, DollarSign, Shield, CheckCircle, Calculator, Info, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function FeesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Wepply</h1>
            </div>
            <Link href="/">
              <Button variant="ghost" className="text-gray-300 hover:text-gray-300">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-200">
            💰 Transparent Pricing
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Clear, upfront
            <br />
            <span className="text-green-400">
              fee structure
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            No hidden costs, no surprise fees. We believe in complete transparency 
            when it comes to our payment management services.
          </p>
        </div>
      </section>

      {/* Main Fees Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Fee Structure
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              One simple administrative fee covers all our payment management services. 
              No interest, no late fees, no hidden costs.
            </p>
          </div>
          
          {/* Main Fee Card */}
          <div className="max-w-4xl mx-auto mb-16">
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-green-50 to-blue-50">
              <CardHeader className="text-center pb-8">
                <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                  Administrative Fee
                </CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Service management fee for payment processing and coordination
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-8">
                  <div className="text-6xl font-bold text-green-600 mb-2">2.5%</div>
                  <p className="text-xl text-gray-700">of total tuition amount</p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Example Calculation</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600">Total Tuition Amount</span>
                      <span className="font-semibold">$12,000</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600">Administrative Fee (2.5%)</span>
                      <span className="font-semibold text-green-600">$300</span>
                    </div>
                    <div className="flex justify-between items-center py-2 bg-green-50 rounded-lg px-4 py-3">
                      <span className="font-semibold text-gray-900">Total Amount You Pay</span>
                      <span className="font-bold text-green-600 text-lg">$12,300</span>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">No Interest</h4>
                    <p className="text-sm text-gray-600">We don't charge interest on your payments</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">No Late Fees</h4>
                    <p className="text-sm text-gray-600">No penalties for late payments</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Info className="w-6 h-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">No Hidden Costs</h4>
                    <p className="text-sm text-gray-600">What you see is what you pay</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* What's Included Section */}
          <div className="max-w-6xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              What's Included in Our Fee
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                      <Calculator className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Payment Processing</h3>
                      <p className="text-sm text-gray-600">Secure payment handling</p>
                    </div>
                  </div>
                  <p className="text-gray-700">
                    We handle all payment processing securely through our payment partners, 
                    ensuring your tuition payments reach your university on time.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <GraduationCap className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">University Coordination</h3>
                      <p className="text-sm text-gray-600">Direct university partnership</p>
                    </div>
                  </div>
                  <p className="text-gray-700">
                    We work directly with your university to coordinate payment schedules 
                    and ensure compliance with their tuition payment requirements.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                      <Shield className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Customer Support</h3>
                      <p className="text-sm text-gray-600">24/7 assistance</p>
                    </div>
                  </div>
                  <p className="text-gray-700">
                    Dedicated customer support to help you manage your payment schedule 
                    and answer any questions about your tuition payments.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    Why do you charge an administrative fee?
                  </h3>
                  <p className="text-gray-700">
                    Our administrative fee covers the cost of payment processing, university coordination, 
                    customer support, and maintaining our secure payment management platform. This fee 
                    allows us to provide you with flexible payment options without requiring a credit check.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    Is this fee similar to interest on a loan?
                  </h3>
                  <p className="text-gray-700">
                    No, this is not interest. We are not a lender and do not provide credit. Our 
                    administrative fee is a one-time service charge for payment management services, 
                    similar to fees charged by payment processors or financial service providers.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    Can I avoid paying this fee?
                  </h3>
                  <p className="text-gray-700">
                    The administrative fee is required for all payment management services. However, 
                    you can always pay your full tuition directly to your university if you prefer 
                    to avoid our services entirely.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    When is the fee due?
                  </h3>
                  <p className="text-gray-700">
                    The administrative fee is included in your first payment when you set up your 
                    payment schedule. There are no additional fees throughout your payment plan.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Set up your flexible payment schedule today with complete transparency
          </p>
          <Link href="/">
            <Button 
              size="lg" 
              className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-4"
            >
              Get Started
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Wepply</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Helping international students manage their tuition payments with flexible payment management solutions, working directly with universities.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/" className="hover:text-white">How It Works</Link></li>
                <li><Link href="/fees" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/" className="hover:text-white">Universities</Link></li>
                <li><Link href="/" className="hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/" className="hover:text-white">Contact Us</Link></li>
                <li><Link href="/" className="hover:text-white">Status</Link></li>
                <li><Link href="/" className="hover:text-white">Security</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© 2024 Wepply. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
