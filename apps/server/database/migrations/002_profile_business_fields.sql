-- =====================================================
-- AgroNond Database Schema - Profile Business Fields
-- Run this in Supabase SQL Editor to add new columns
-- =====================================================

-- Add business-related columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS business_name TEXT,
ADD COLUMN IF NOT EXISTS gst_number TEXT,
ADD COLUMN IF NOT EXISTS license_number TEXT,
ADD COLUMN IF NOT EXISTS business_address TEXT,
ADD COLUMN IF NOT EXISTS operating_locations TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- =====================================================
-- Verification: Check if columns were added
-- =====================================================
-- Run this to verify:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'profiles';
