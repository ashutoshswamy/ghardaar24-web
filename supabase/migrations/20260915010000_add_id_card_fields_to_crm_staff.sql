-- Migration: Add ID card fields to crm_staff
-- Description: Lets admin generate a staff ID card (employee code + designation), which staff can then view.

ALTER TABLE public.crm_staff
  ADD COLUMN IF NOT EXISTS employee_code TEXT,
  ADD COLUMN IF NOT EXISTS designation TEXT,
  ADD COLUMN IF NOT EXISTS id_card_issued_at TIMESTAMPTZ;
