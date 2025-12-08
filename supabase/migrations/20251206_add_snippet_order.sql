-- Add order column to sni_snippets table
ALTER TABLE sni_snippets 
ADD COLUMN "order" integer DEFAULT 0;

-- Update existing snippets to have a sequential order based on creation time (optional but good for consistency)
WITH numbered_snippets AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY created_at ASC) - 1 as new_order
    FROM sni_snippets
)
UPDATE sni_snippets
SET "order" = numbered_snippets.new_order
FROM numbered_snippets
WHERE sni_snippets.id = numbered_snippets.id;
