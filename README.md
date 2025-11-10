# Wepply - Student Tuition Split Platform

A modern PWA application built with Next.js that allows students to split their tuition payments into manageable installments.

## Features

- 🎓 **Student-focused**: Built specifically for university students
- 💳 **Flexible Payment Plans**: Monthly, semester, or yearly payment options
- 🔒 **Secure**: Bank-level security with Stripe payment processing
- 📱 **PWA**: Progressive Web App for mobile and desktop
- 🎨 **Modern UI**: Beautiful interface built with shadcn/ui
- 🔐 **Authentication**: Secure user management with Clerk
- 💾 **Database**: Reliable data storage with Supabase

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Authentication**: Clerk
- **Database**: Supabase
- **Payments**: Stripe
- **Email**: Resend (for onboarding completion emails)
- **PWA**: next-pwa

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Clerk account
- Stripe account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wepply
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Stripe
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

   # Resend Email (Optional - for onboarding emails)
   RESEND_API_KEY=re_B5f25EBx_Hdh4dfU4jzat6kMC1eb82wYX
   RESEND_FROM_EMAIL=noreply@notifications.tryinstallo.com
   ```

4. **Set up Supabase database**
   - Create a new Supabase project
   - Run the SQL commands from `supabase-schema.sql` in your Supabase SQL editor

5. **Configure Clerk**
   - Create a Clerk application
   - Set up the sign-in and sign-up URLs
   - Configure the redirect URLs

6. **Configure Stripe**
   - Create a Stripe account
   - Set up webhooks pointing to `/api/webhooks/stripe`
   - Enable the necessary payment methods

7. **Configure Resend (Optional)**
   - Create a Resend account at [resend.com](https://resend.com)
   - Get your API key and add it to `.env.local`
   - See `RESEND_EMAIL_SETUP.md` for detailed instructions

8. **Run the development server**
   ```bash
   npm run dev
   ```

9. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
wepply/
├── src/
│   ├── app/
│   │   ├── api/                 # API routes
│   │   ├── onboarding/          # Onboarding flow
│   │   ├── sign-in/             # Sign-in page
│   │   ├── sign-up/             # Sign-up page
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Home page
│   ├── components/
│   │   └── ui/                  # shadcn/ui components
│   └── lib/
│       ├── supabase.ts          # Supabase client
│       ├── stripe.ts            # Stripe configuration
│       └── utils.ts             # Utility functions
├── public/
│   └── manifest.json            # PWA manifest
├── supabase-schema.sql          # Database schema
└── next.config.ts               # Next.js configuration
```

## Onboarding Flow

The application features a 7-step onboarding process:

1. **Welcome**: Introduction and user verification
2. **University Selection**: Choose from supported universities
3. **Tuition Information**: Enter tuition amount (up to $6,000), student ID, and email
4. **Payment Plan**: Select monthly, semester, or yearly payment options
5. **Review**: Confirm all details before payment
6. **Payment**: Secure payment processing with Stripe
7. **Thank You**: Confirmation and next steps

## Payment Plans

- **Monthly**: 12 payments per year
- **Semester**: 2 payments per year
- **Yearly**: 1 payment per year

## API Endpoints

- `POST /api/create-payment-intent`: Creates a Stripe payment intent
- `POST /api/webhooks/stripe`: Handles Stripe webhook events

## Database Schema

### user_profiles
- `id`: UUID primary key
- `clerk_user_id`: Clerk user identifier
- `university`: Selected university
- `tuition_amount`: Tuition amount (max $6,000)
- `student_id`: Student ID
- `student_email`: Student email
- `payment_plan`: Selected payment plan
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### payments
- `id`: UUID primary key
- `user_id`: Reference to user_profiles
- `stripe_payment_intent_id`: Stripe payment intent ID
- `amount`: Payment amount in cents
- `status`: Payment status (pending/succeeded/failed)
- `created_at`: Creation timestamp

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@wepply.com or create an issue in the repository.