-- Migration: Add CRM Activity Logs Table
-- Description: Creates a table to track all staff actions on CRM clients for audit purposes

-- ============================================================================
-- CRM ACTIVITY LOGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.crm_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Staff who made the change
    staff_id UUID NOT NULL,
    staff_name TEXT NOT NULL,
    
    -- Client that was modified
    client_id UUID NOT NULL,
    client_name TEXT NOT NULL,
    
    -- Sheet context (optional)
    sheet_id UUID,
    sheet_name TEXT,
    
    -- Action details
    action_type TEXT NOT NULL, -- 'update_field', 'add_comment'
    field_changed TEXT,        -- 'lead_stage', 'lead_type', 'location_category', etc.
    old_value TEXT,
    new_value TEXT,
    
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.crm_activity_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all logs
CREATE POLICY "Admins can view activity logs"
    ON public.crm_activity_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.admins WHERE id = auth.uid()
        )
    );

-- Staff can insert logs (for their own actions)
CREATE POLICY "Staff can insert activity logs"
    ON public.crm_activity_logs
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.crm_staff WHERE id = auth.uid() AND is_active = true
        )
    );

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_crm_activity_logs_created_at ON public.crm_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_activity_logs_staff_id ON public.crm_activity_logs(staff_id);
CREATE INDEX IF NOT EXISTS idx_crm_activity_logs_client_id ON public.crm_activity_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_crm_activity_logs_sheet_id ON public.crm_activity_logs(sheet_id);

-- Add comment for documentation
COMMENT ON TABLE public.crm_activity_logs IS 'Audit log of all staff actions on CRM clients';
