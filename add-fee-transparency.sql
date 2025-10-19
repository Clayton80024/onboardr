-- Migration to add admin_fee and total_amount fields for transparency
-- Run this in your Supabase SQL editor

-- Add new columns to onboarding_data table
alter table onboarding_data 
add column if not exists admin_fee numeric(10, 2),
add column if not exists total_amount numeric(10, 2);

-- Update existing records to calculate admin_fee and total_amount
-- This will populate the new fields for existing data using percentage-based fees
update onboarding_data 
set 
  admin_fee = case 
    when payment_plan = 'basic' then tuition_amount * 0.055  -- 5.5% fee
    when payment_plan = 'premium' then tuition_amount * 0.065  -- 6.5% fee
    when payment_plan = 'flexible' then tuition_amount * 0.08  -- 8% fee
    else 0.00
  end,
  total_amount = tuition_amount + case 
    when payment_plan = 'basic' then tuition_amount * 0.055  -- 5.5% fee
    when payment_plan = 'premium' then tuition_amount * 0.065  -- 6.5% fee
    when payment_plan = 'flexible' then tuition_amount * 0.08  -- 8% fee
    else 0.00
  end
where admin_fee is null or total_amount is null;

-- Add constraints to ensure data integrity
alter table onboarding_data 
alter column admin_fee set not null,
alter column total_amount set not null;

-- Add check constraint to ensure total_amount = tuition_amount + admin_fee
alter table onboarding_data 
add constraint check_total_amount 
check (total_amount = tuition_amount + admin_fee);
