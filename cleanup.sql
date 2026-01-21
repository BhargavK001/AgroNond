-- Database Cleanup Script
-- Drops all business logic tables while preserving Users, Profiles, and Auth
-- Run this in your Supabase SQL Editor

DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS purchases CASCADE;
DROP TABLE IF EXISTS farmer_contacts CASCADE;
DROP TABLE IF EXISTS records CASCADE;
DROP TABLE IF EXISTS commission_rules CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS finance_records CASCADE; -- Assuming this might exist from finance.js
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS financing_records CASCADE;
DROP TABLE IF EXISTS finance CASCADE; -- Just in case

-- Remove specific columns from profiles table to strip it down to basics
ALTER TABLE profiles 
DROP COLUMN IF EXISTS business_name,
DROP COLUMN IF EXISTS gst_number,
DROP COLUMN IF EXISTS license_number,
DROP COLUMN IF EXISTS business_address,
DROP COLUMN IF EXISTS operating_locations,
DROP COLUMN IF EXISTS avatar_url;

-- Drop related functions/triggers if they persist (optional, but good practice)
-- Note: Dropping tables usually removes attached triggers. 
-- Functions might remain but won't harm anything if unused.

SELECT 'Database cleanup completed successfully. Auth and Profiles preserved.' as message;
