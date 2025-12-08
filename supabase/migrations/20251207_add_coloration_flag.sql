-- Add is_coloration_compatible column to sni_snippets table
ALTER TABLE sni_snippets 
ADD COLUMN is_coloration_compatible BOOLEAN DEFAULT TRUE;

-- Update existing records to have default value
UPDATE sni_snippets 
SET is_coloration_compatible = TRUE 
WHERE is_coloration_compatible IS NULL;
