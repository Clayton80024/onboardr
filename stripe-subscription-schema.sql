-- Create onboarding_data table for storing user onboarding information
create table onboarding_data (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  university_name text not null,
  tuition_amount numeric(10, 2) not null,
  student_id text not null,
  student_email text not null,
  payment_plan text not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_payment_method_id text,
  status text default 'pending' not null,
  -- Personal Information
  first_name text,
  last_name text,
  email text,
  phone_number text,
  address text,
  city text,
  state text,
  zip_code text,
  country text default 'United States',
  -- Emergency Contact
  emergency_contact_name text,
  emergency_contact_phone text,
  emergency_contact_relationship text,
  -- Banking Information
  bank_name text,
  account_number text,
  routing_number text,
  account_type text default 'checking',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create installments table for tracking payment schedule
create table installments (
  id uuid primary key default uuid_generate_v4(),
  onboarding_id uuid references onboarding_data on delete cascade not null,
  installment_number integer not null,
  amount numeric(10, 2) not null,
  due_date timestamp with time zone not null,
  status text default 'pending' not null, -- pending, paid, failed, cancelled
  stripe_payment_intent_id text,
  stripe_invoice_id text,
  failure_reason text,
  paid_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Set up Row Level Security (RLS)
alter table onboarding_data enable row level security;
alter table installments enable row level security;

-- Policies for onboarding_data
create policy "Users can view their own onboarding data."
  on onboarding_data for select using (auth.jwt() ->> 'sub' = user_id);

create policy "Users can insert their own onboarding data."
  on onboarding_data for insert with check (auth.jwt() ->> 'sub' = user_id);

create policy "Users can update their own onboarding data."
  on onboarding_data for update using (auth.jwt() ->> 'sub' = user_id);

-- Policies for installments
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

-- Create indexes for better performance
create index idx_onboarding_data_user_id on onboarding_data(user_id);
create index idx_onboarding_data_status on onboarding_data(status);
create index idx_installments_onboarding_id on installments(onboarding_id);
create index idx_installments_due_date on installments(due_date);
create index idx_installments_status on installments(status);

-- Create function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger update_onboarding_data_updated_at 
  before update on onboarding_data 
  for each row execute function update_updated_at_column();

create trigger update_installments_updated_at 
  before update on installments 
  for each row execute function update_updated_at_column();
