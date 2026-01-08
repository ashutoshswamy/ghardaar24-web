-- Migration: Fix CRM Real-time Synchronization
-- Description: Adds UPDATE policy for staff and enables real-time replication for CRM tables
-- NOTE: Run this in Supabase SQL Editor

-- ============================================================================
-- FIX: STAFF UPDATE POLICY FOR CRM CLIENTS
-- ============================================================================
-- Staff currently can only SELECT clients, but they need to UPDATE them too
-- for inline editing to work properly and sync across all users

-- Allow staff to update clients from sheets they have access to
CREATE POLICY "Staff can update accessible clients"
    ON public.crm_clients
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.crm_sheet_access 
            WHERE sheet_id = crm_clients.sheet_id 
            AND staff_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.crm_sheet_access 
            WHERE sheet_id = crm_clients.sheet_id 
            AND staff_id = auth.uid()
        )
    );

-- ============================================================================
-- ENABLE REAL-TIME REPLICATION FOR CRM TABLES
-- ============================================================================
-- Supabase requires explicit opt-in for real-time updates on tables
-- This adds the tables to the supabase_realtime publication

-- Drop existing publication if exists and recreate with all necessary tables
-- Note: The default 'supabase_realtime' publication should already exist

-- Add crm_clients to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_clients;

-- Add crm_sheets to realtime publication (for sheet updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_sheets;

-- ============================================================================
-- GRANT PERMISSIONS FOR REAL-TIME
-- ============================================================================
-- Ensure authenticated users can use real-time features

GRANT SELECT ON public.crm_clients TO authenticated;
GRANT UPDATE ON public.crm_clients TO authenticated;

GRANT SELECT ON public.crm_sheets TO authenticated;

-- ============================================================================
-- NOTIFY: Instructions for Supabase Dashboard
-- ============================================================================
-- IMPORTANT: After running this migration, verify in Supabase Dashboard:
-- 1. Go to Database > Replication
-- 2. Ensure 'crm_clients' and 'crm_sheets' are listed under supabase_realtime
-- 3. Toggle ON if not already enabled
-- 4. Alternatively, use the Table Editor and enable Realtime on each table
