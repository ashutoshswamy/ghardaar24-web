-- Migration: Add CRM Sheets and Staff Access Control
-- Description: Adds tables for sheet management, staff users, and access control
-- NOTE: Run this in Supabase SQL Editor

-- ============================================================================
-- CRM SHEETS TABLE
-- ============================================================================
-- Stores sheet metadata for organizing imported client data

CREATE TABLE IF NOT EXISTS public.crm_sheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.admins(id) ON DELETE SET NULL,
    UNIQUE(name)
);

-- Enable RLS
ALTER TABLE public.crm_sheets ENABLE ROW LEVEL SECURITY;

-- Create index
CREATE INDEX IF NOT EXISTS idx_crm_sheets_created_at ON public.crm_sheets(created_at DESC);

-- ============================================================================
-- CRM STAFF TABLE
-- ============================================================================
-- Stores staff user profiles linked to auth.users

CREATE TABLE IF NOT EXISTS public.crm_staff (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.admins(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.crm_staff ENABLE ROW LEVEL SECURITY;

-- Create index
CREATE INDEX IF NOT EXISTS idx_crm_staff_is_active ON public.crm_staff(is_active);

-- ============================================================================
-- CRM SHEET ACCESS TABLE
-- ============================================================================
-- Links staff to permitted sheets

CREATE TABLE IF NOT EXISTS public.crm_sheet_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL REFERENCES public.crm_staff(id) ON DELETE CASCADE,
    sheet_id UUID NOT NULL REFERENCES public.crm_sheets(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES public.admins(id) ON DELETE SET NULL,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(staff_id, sheet_id)
);

-- Enable RLS
ALTER TABLE public.crm_sheet_access ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_crm_sheet_access_staff_id ON public.crm_sheet_access(staff_id);
CREATE INDEX IF NOT EXISTS idx_crm_sheet_access_sheet_id ON public.crm_sheet_access(sheet_id);

-- ============================================================================
-- MODIFY CRM CLIENTS TABLE
-- ============================================================================
-- Add sheet_id column to link clients to sheets

ALTER TABLE public.crm_clients 
ADD COLUMN IF NOT EXISTS sheet_id UUID REFERENCES public.crm_sheets(id) ON DELETE CASCADE;

-- Create index for sheet filtering
CREATE INDEX IF NOT EXISTS idx_crm_clients_sheet_id ON public.crm_clients(sheet_id);

-- ============================================================================
-- RLS POLICIES (created after all tables exist)
-- ============================================================================

-- Admins can manage all sheets
CREATE POLICY "Admins can manage CRM sheets"
    ON public.crm_sheets
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.admins WHERE id = auth.uid()
        )
    );

-- Staff can read sheets they have access to
CREATE POLICY "Staff can read accessible sheets"
    ON public.crm_sheets
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.crm_sheet_access 
            WHERE sheet_id = crm_sheets.id 
            AND staff_id = auth.uid()
        )
    );

-- Staff can read their own profile
CREATE POLICY "Staff can read own profile"
    ON public.crm_staff
    FOR SELECT
    USING (auth.uid() = id);

-- Admins can manage all staff
CREATE POLICY "Admins can manage CRM staff"
    ON public.crm_staff
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.admins WHERE id = auth.uid()
        )
    );

-- Staff can read their own access entries
CREATE POLICY "Staff can read own access"
    ON public.crm_sheet_access
    FOR SELECT
    USING (auth.uid() = staff_id);

-- Admins can manage all access entries
CREATE POLICY "Admins can manage sheet access"
    ON public.crm_sheet_access
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.admins WHERE id = auth.uid()
        )
    );

-- Allow staff to read clients from sheets they have access to
CREATE POLICY "Staff can read accessible clients"
    ON public.crm_clients
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.crm_sheet_access 
            WHERE sheet_id = crm_clients.sheet_id 
            AND staff_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.admins WHERE id = auth.uid()
        )
    );

-- ============================================================================
-- CREATE DEFAULT SHEET FOR EXISTING DATA
-- ============================================================================
-- Creates a default sheet and assigns all existing clients to it

DO $$
DECLARE
    default_sheet_id UUID;
BEGIN
    -- Insert default sheet if it doesn't exist
    INSERT INTO public.crm_sheets (name, description)
    VALUES ('Default', 'Default sheet for existing clients')
    ON CONFLICT (name) DO NOTHING
    RETURNING id INTO default_sheet_id;
    
    -- If insert returned null (conflict), get the existing id
    IF default_sheet_id IS NULL THEN
        SELECT id INTO default_sheet_id FROM public.crm_sheets WHERE name = 'Default';
    END IF;
    
    -- Update existing clients without a sheet_id
    UPDATE public.crm_clients 
    SET sheet_id = default_sheet_id 
    WHERE sheet_id IS NULL;
END $$;
