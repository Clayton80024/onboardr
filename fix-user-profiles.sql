-- Fix user_profiles table schema
-- This script updates the existing user_profiles table to match the API requirements

-- First, let's check if the table exists and what columns it has
-- You can run this to see the current structure:
-- \d user_profiles

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

-- Drop the table if it exists (this will also drop dependent objects)
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Recreate user_profiles table with correct schema
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL, -- Clerk user ID
  university_id UUID REFERENCES universities(id),
  university_name TEXT NOT NULL,
  payment_plan TEXT NOT NULL CHECK (payment_plan IN ('basic', 'premium', 'flexible', 'full')),
  tuition_amount DECIMAL(10,2) NOT NULL CHECK (tuition_amount <= 6000),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'United States',
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  bank_name TEXT,
  account_number TEXT,
  routing_number TEXT,
  account_type TEXT DEFAULT 'checking',
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_university_id ON user_profiles(university_id);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);

-- Create RLS policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');

-- Create trigger for updated_at timestamp
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Verify the table was created correctly
-- You can run this to check:
-- \d user_profiles

-- Test insert (optional - remove in production)
-- INSERT INTO user_profiles (
--   user_id, university_name, payment_plan, tuition_amount, 
--   first_name, last_name, email
-- ) VALUES (
--   'test_user_123', 'Test University', 'basic', 5000.00,
--   'John', 'Doe', 'john.doe@test.com'
-- );

-- Clean up test data (uncomment if you ran the test insert)
-- DELETE FROM user_profiles WHERE user_id = 'test_user_123';
