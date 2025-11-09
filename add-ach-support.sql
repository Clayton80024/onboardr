-- Add ACH payment support to installments table
-- This script adds the necessary fields to support payment links and ACH payments

-- Add payment link and method fields to installments table
ALTER TABLE installments 
ADD COLUMN IF NOT EXISTS payment_link TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'card' CHECK (payment_method IN ('card', 'ach')),
ADD COLUMN IF NOT EXISTS payment_link_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_link_id TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_installments_payment_method ON installments(payment_method);
CREATE INDEX IF NOT EXISTS idx_installments_payment_link ON installments(payment_link);
CREATE INDEX IF NOT EXISTS idx_installments_payment_link_expires ON installments(payment_link_expires_at);

-- Add comments for documentation
COMMENT ON COLUMN installments.payment_link IS 'Stripe payment link URL for ACH payments';
COMMENT ON COLUMN installments.payment_method IS 'Payment method used: card or ach';
COMMENT ON COLUMN installments.payment_link_expires_at IS 'When the payment link expires';
COMMENT ON COLUMN installments.payment_link_id IS 'Stripe payment link ID for reference';

-- Update existing installments to have 'card' as default payment method
UPDATE installments 
SET payment_method = 'card' 
WHERE payment_method IS NULL;

-- Add a function to check if payment link is expired
CREATE OR REPLACE FUNCTION is_payment_link_expired(installment_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT payment_link_expires_at INTO expires_at
    FROM installments 
    WHERE id = installment_id;
    
    IF expires_at IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Add a function to generate new payment link for expired links
CREATE OR REPLACE FUNCTION refresh_expired_payment_link(installment_id UUID)
RETURNS TEXT AS $$
DECLARE
    installment_record RECORD;
    new_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get installment details
    SELECT * INTO installment_record
    FROM installments 
    WHERE id = installment_id;
    
    -- Set new expiration (30 days from now)
    new_expires_at := NOW() + INTERVAL '30 days';
    
    -- Update the installment with new expiration
    UPDATE installments 
    SET payment_link_expires_at = new_expires_at
    WHERE id = installment_id;
    
    RETURN installment_record.payment_link;
END;
$$ LANGUAGE plpgsql;
