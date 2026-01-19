-- =====================================================
-- SUPABASE COMPLETE RESET SCRIPT
-- Run this in Supabase SQL Editor to clean everything
-- =====================================================

-- Step 1: Drop triggers first (they depend on functions)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 3: Drop all policies on profiles table (if exists)
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
    END LOOP;
END $$;

-- Step 4: Drop the profiles table completely
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Step 5: Delete all users from auth (this clears authentication data)
-- WARNING: This deletes ALL users!
DELETE FROM auth.users;

-- =====================================================
-- Verification: Confirm everything is cleaned
-- =====================================================
-- Run these to verify the reset worked:
-- SELECT * FROM public.profiles; -- Should error: "relation does not exist"
-- SELECT * FROM auth.users; -- Should return 0 rows

-- =====================================================
-- SUCCESS! Now run the migration script:
-- apps/server/database/migrations/001_profiles.sql
-- =====================================================
