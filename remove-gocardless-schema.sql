-- Remove GoCardless Integration Schema Changes
-- This script removes all GoCardless-related tables and columns

-- Drop GoCardless tables
DROP TABLE IF EXISTS gocardless_bank_accounts CASCADE;
DROP TABLE IF EXISTS gocardless_customers CASCADE;
DROP TABLE IF EXISTS gocardless_mandates CASCADE;

-- Remove GoCardless columns from payments table
ALTER TABLE payments 
DROP COLUMN IF EXISTS payment_provider,
DROP COLUMN IF EXISTS gocardless_mandate_id,
DROP COLUMN IF EXISTS gocardless_payment_id,
DROP COLUMN IF EXISTS mandate_status;

-- Remove GoCardless columns from installments table
ALTER TABLE installments 
DROP COLUMN IF EXISTS payment_provider,
DROP COLUMN IF EXISTS gocardless_billing_request_id,
DROP COLUMN IF EXISTS payment_link_url,
DROP COLUMN IF EXISTS payment_link_expires_at;

-- Drop GoCardless indexes
DROP INDEX IF EXISTS idx_payments_payment_provider;
DROP INDEX IF EXISTS idx_payments_gocardless_mandate_id;
DROP INDEX IF EXISTS idx_payments_gocardless_payment_id;
DROP INDEX IF EXISTS idx_gocardless_mandates_user_id;
DROP INDEX IF EXISTS idx_gocardless_mandates_mandate_id;
DROP INDEX IF EXISTS idx_gocardless_customers_user_id;
DROP INDEX IF EXISTS idx_gocardless_customers_customer_id;
DROP INDEX IF EXISTS idx_gocardless_bank_accounts_user_id;
DROP INDEX IF EXISTS idx_gocardless_bank_accounts_customer_id;
DROP INDEX IF EXISTS idx_installments_billing_request_id;
DROP INDEX IF EXISTS idx_payments_billing_request_id;

-- Note: This script will remove all GoCardless-related data
-- Make sure to backup any important data before running this script


