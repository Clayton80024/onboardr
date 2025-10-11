import { loadStripe } from '@stripe/stripe-js'
import Stripe from 'stripe'

export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export const formatAmountForStripe = (amount: number): number => {
  return Math.round(amount * 100)
}

export const formatAmountFromStripe = (amount: number): number => {
  return amount / 100
}




