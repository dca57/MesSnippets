-- Add is_admin_compatible column to sni_snippets table
ALTER TABLE sni_snippets 
ADD COLUMN is_admin_compatible BOOLEAN DEFAULT TRUE;

-- Update existing records to have default value
UPDATE sni_snippets 
SET is_admin_compatible = TRUE 
WHERE is_admin_compatible IS NULL;
