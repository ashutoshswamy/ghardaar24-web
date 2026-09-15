-- Migration: Add city to revenue_entries
-- Description: Adds city for city-wise revenue reporting.

ALTER TABLE public.revenue_entries
  ADD COLUMN IF NOT EXISTS city TEXT;

CREATE INDEX IF NOT EXISTS idx_revenue_entries_city ON public.revenue_entries (city);
