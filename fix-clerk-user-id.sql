-- Migration to fix user_id column type for Clerk integration
-- Run this in your Supabase SQL editor

-- First, drop existing policies
drop policy if exists "Users can view their own onboarding data." on onboarding_data;
drop policy if exists "Users can insert their own onboarding data." on onboarding_data;
drop policy if exists "Users can update their own onboarding data." on onboarding_data;
drop policy if exists "Users can view their own installments." on installments;
drop policy if exists "Users can insert their own installments." on installments;
drop policy if exists "Users can update their own installments." on installments;

-- Drop the foreign key constraint if it exists
alter table onboarding_data drop constraint if exists onboarding_data_user_id_fkey;

-- Change user_id column type from uuid to text
alter table onboarding_data alter column user_id type text;

-- Recreate policies with Clerk JWT support
create policy "Users can view their own onboarding data."
  on onboarding_data for select using (auth.jwt() ->> 'sub' = user_id);

create policy "Users can insert their own onboarding data."
  on onboarding_data for insert with check (auth.jwt() ->> 'sub' = user_id);

create policy "Users can update their own onboarding data."
  on onboarding_data for update using (auth.jwt() ->> 'sub' = user_id);

create policy "Users can view their own installments."
  on installments for select using (
    exists (
      select 1 from onboarding_data 
      where onboarding_data.id = installments.onboarding_id 
      and onboarding_data.user_id = auth.jwt() ->> 'sub'
    )
  );

create policy "Users can insert their own installments."
  on installments for insert with check (
    exists (
      select 1 from onboarding_data 
      where onboarding_data.id = installments.onboarding_id 
      and onboarding_data.user_id = auth.jwt() ->> 'sub'
    )
  );

create policy "Users can update their own installments."
  on installments for update using (
    exists (
      select 1 from onboarding_data 
      where onboarding_data.id = installments.onboarding_id 
      and onboarding_data.user_id = auth.jwt() ->> 'sub'
    )
  );
