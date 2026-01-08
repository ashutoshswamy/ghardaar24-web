-- Migration: Add Calling Comment History
-- Description: Adds calling_comment_history JSONB column to store timestamped comment history

-- ============================================================================
-- ADD CALLING COMMENT HISTORY COLUMN
-- ============================================================================

-- Add the new JSONB column for storing comment history
ALTER TABLE public.crm_clients 
ADD COLUMN IF NOT EXISTS calling_comment_history JSONB DEFAULT '[]'::jsonb;

-- Migrate existing calling_comment data to the new history format
-- This will convert existing text comments to the first entry in the history array
UPDATE public.crm_clients 
SET calling_comment_history = jsonb_build_array(
    jsonb_build_object(
        'comment', calling_comment,
        'date', to_char(COALESCE(updated_at, created_at, NOW()), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
        'addedBy', 'migrated'
    )
)
WHERE calling_comment IS NOT NULL 
AND calling_comment != '' 
AND (calling_comment_history IS NULL OR calling_comment_history = '[]'::jsonb);

-- Create an index for better query performance on the history field
CREATE INDEX IF NOT EXISTS idx_crm_clients_calling_comment_history 
ON public.crm_clients USING gin(calling_comment_history);

-- Add comment for documentation
COMMENT ON COLUMN public.crm_clients.calling_comment_history IS 'JSONB array of calling comment history entries. Each entry has: comment (string), date (ISO string), addedBy (optional string)';
