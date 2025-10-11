-- Note: We don't enable RLS on auth.users as it's a system table owned by Supabase
-- Instead, we enable RLS on our custom tables and use Clerk for authentication

-- Create universities table
CREATE TABLE universities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'United States',
  logo_url TEXT,
  website_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_profiles table
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

-- Create payments table
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT REFERENCES user_profiles(user_id) ON DELETE CASCADE, -- Clerk user ID
  amount DECIMAL(10,2) NOT NULL, -- Amount in dollars
  payment_plan TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed')),
  due_date TIMESTAMP WITH TIME ZONE,
  payment_type TEXT DEFAULT 'tuition',
  stripe_payment_intent_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on our tables
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_universities_name ON universities(name);
CREATE INDEX idx_universities_country ON universities(country);
CREATE INDEX idx_universities_active ON universities(is_active);
CREATE INDEX idx_user_profiles_clerk_user_id ON user_profiles(clerk_user_id);
CREATE INDEX idx_user_profiles_university_id ON user_profiles(university_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_stripe_payment_intent_id ON payments(stripe_payment_intent_id);

-- Row Level Security Policies
-- Universities table - public read access for all users
CREATE POLICY "Anyone can view universities" ON universities
  FOR SELECT USING (is_active = true);

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can view their own payments" ON payments
  FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert their own payments" ON payments
  FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_universities_updated_at
  BEFORE UPDATE ON universities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert university data
INSERT INTO universities (name, short_name, city, state, country, website_url) VALUES
-- Top US Universities
('Harvard University', 'Harvard', 'Cambridge', 'Massachusetts', 'United States', 'https://www.harvard.edu'),
('Massachusetts Institute of Technology', 'MIT', 'Cambridge', 'Massachusetts', 'United States', 'https://www.mit.edu'),
('Stanford University', 'Stanford', 'Stanford', 'California', 'United States', 'https://www.stanford.edu'),
('University of California, Berkeley', 'UC Berkeley', 'Berkeley', 'California', 'United States', 'https://www.berkeley.edu'),
('Yale University', 'Yale', 'New Haven', 'Connecticut', 'United States', 'https://www.yale.edu'),
('Princeton University', 'Princeton', 'Princeton', 'New Jersey', 'United States', 'https://www.princeton.edu'),
('Columbia University', 'Columbia', 'New York', 'New York', 'United States', 'https://www.columbia.edu'),
('University of Chicago', 'UChicago', 'Chicago', 'Illinois', 'United States', 'https://www.uchicago.edu'),
('University of Pennsylvania', 'UPenn', 'Philadelphia', 'Pennsylvania', 'United States', 'https://www.upenn.edu'),
('California Institute of Technology', 'Caltech', 'Pasadena', 'California', 'United States', 'https://www.caltech.edu'),

-- Additional Popular Universities
('New York University', 'NYU', 'New York', 'New York', 'United States', 'https://www.nyu.edu'),
('University of California, Los Angeles', 'UCLA', 'Los Angeles', 'California', 'United States', 'https://www.ucla.edu'),
('University of Michigan', 'UMich', 'Ann Arbor', 'Michigan', 'United States', 'https://www.umich.edu'),
('University of Virginia', 'UVA', 'Charlottesville', 'Virginia', 'United States', 'https://www.virginia.edu'),
('Duke University', 'Duke', 'Durham', 'North Carolina', 'United States', 'https://www.duke.edu'),
('Northwestern University', 'Northwestern', 'Evanston', 'Illinois', 'United States', 'https://www.northwestern.edu'),
('Cornell University', 'Cornell', 'Ithaca', 'New York', 'United States', 'https://www.cornell.edu'),
('Rice University', 'Rice', 'Houston', 'Texas', 'United States', 'https://www.rice.edu'),
('Washington University in St. Louis', 'WashU', 'St. Louis', 'Missouri', 'United States', 'https://www.wustl.edu'),
('Emory University', 'Emory', 'Atlanta', 'Georgia', 'United States', 'https://www.emory.edu'),

-- State Universities
('University of California, San Diego', 'UCSD', 'San Diego', 'California', 'United States', 'https://www.ucsd.edu'),
('University of California, Irvine', 'UCI', 'Irvine', 'California', 'United States', 'https://www.uci.edu'),
('University of California, Davis', 'UC Davis', 'Davis', 'California', 'United States', 'https://www.ucdavis.edu'),
('University of California, Santa Barbara', 'UCSB', 'Santa Barbara', 'California', 'United States', 'https://www.ucsb.edu'),
('University of California, Santa Cruz', 'UCSC', 'Santa Cruz', 'California', 'United States', 'https://www.ucsc.edu'),
('University of California, Riverside', 'UCR', 'Riverside', 'California', 'United States', 'https://www.ucr.edu'),
('University of California, Merced', 'UC Merced', 'Merced', 'California', 'United States', 'https://www.ucmerced.edu'),
('University of Texas at Austin', 'UT Austin', 'Austin', 'Texas', 'United States', 'https://www.utexas.edu'),
('University of Florida', 'UF', 'Gainesville', 'Florida', 'United States', 'https://www.ufl.edu'),
('University of Washington', 'UW', 'Seattle', 'Washington', 'United States', 'https://www.washington.edu'),

-- International Universities
('University of Toronto', 'UofT', 'Toronto', 'Ontario', 'Canada', 'https://www.utoronto.ca'),
('McGill University', 'McGill', 'Montreal', 'Quebec', 'Canada', 'https://www.mcgill.ca'),
('University of British Columbia', 'UBC', 'Vancouver', 'British Columbia', 'Canada', 'https://www.ubc.ca'),
('University of Oxford', 'Oxford', 'Oxford', 'Oxfordshire', 'United Kingdom', 'https://www.ox.ac.uk'),
('University of Cambridge', 'Cambridge', 'Cambridge', 'Cambridgeshire', 'United Kingdom', 'https://www.cam.ac.uk'),
('Imperial College London', 'Imperial', 'London', 'London', 'United Kingdom', 'https://www.imperial.ac.uk'),
('London School of Economics', 'LSE', 'London', 'London', 'United Kingdom', 'https://www.lse.ac.uk'),
('University College London', 'UCL', 'London', 'London', 'United Kingdom', 'https://www.ucl.ac.uk'),
('University of Edinburgh', 'Edinburgh', 'Edinburgh', 'Scotland', 'United Kingdom', 'https://www.ed.ac.uk'),
('King''s College London', 'KCL', 'London', 'London', 'United Kingdom', 'https://www.kcl.ac.uk'),

-- Additional Popular Universities
('Carnegie Mellon University', 'CMU', 'Pittsburgh', 'Pennsylvania', 'United States', 'https://www.cmu.edu'),
('Georgetown University', 'Georgetown', 'Washington', 'District of Columbia', 'United States', 'https://www.georgetown.edu'),
('University of Notre Dame', 'Notre Dame', 'Notre Dame', 'Indiana', 'United States', 'https://www.nd.edu'),
('Vanderbilt University', 'Vanderbilt', 'Nashville', 'Tennessee', 'United States', 'https://www.vanderbilt.edu'),
('University of Southern California', 'USC', 'Los Angeles', 'California', 'United States', 'https://www.usc.edu'),
('Tufts University', 'Tufts', 'Medford', 'Massachusetts', 'United States', 'https://www.tufts.edu'),
('Wake Forest University', 'Wake Forest', 'Winston-Salem', 'North Carolina', 'United States', 'https://www.wfu.edu'),
('University of North Carolina at Chapel Hill', 'UNC', 'Chapel Hill', 'North Carolina', 'United States', 'https://www.unc.edu'),
('Boston University', 'BU', 'Boston', 'Massachusetts', 'United States', 'https://www.bu.edu'),
('Northeastern University', 'Northeastern', 'Boston', 'Massachusetts', 'United States', 'https://www.northeastern.edu');



