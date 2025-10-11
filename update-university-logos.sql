-- Update universities with logo URLs
-- You can upload these logos to your public folder or use external URLs

UPDATE universities SET logo_url = '/harvard_logo.png' WHERE name = 'Harvard University';
UPDATE universities SET logo_url = '/MIT_logo.svg' WHERE name = 'Massachusetts Institute of Technology';
UPDATE universities SET logo_url = '/stanford_logo.avif' WHERE name = 'Stanford University';

-- For universities without logos, you can:
-- 1. Upload logo files to your public folder
-- 2. Use external URLs (like university websites)
-- 3. Leave as NULL to use the fallback letter avatar

-- Example external URLs (replace with actual logo URLs):
-- UPDATE universities SET logo_url = 'https://www.berkeley.edu/sites/default/files/berkeley-logo.png' WHERE name = 'University of California, Berkeley';
-- UPDATE universities SET logo_url = 'https://www.yale.edu/sites/default/files/yale-logo.png' WHERE name = 'Yale University';

-- Check which universities have logos
SELECT name, logo_url FROM universities WHERE logo_url IS NOT NULL ORDER BY name;
