-- =========================================================
-- Supabase table for Pearls of Peace booking requests
-- Run this in Supabase SQL Editor → New Query → Run
-- =========================================================

-- 1. Create the table
CREATE TABLE IF NOT EXISTS booking_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  service TEXT NOT NULL,
  contact_method TEXT NOT NULL,
  message TEXT NOT NULL,
  consent BOOLEAN NOT NULL DEFAULT false,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;

-- 3. No public read access — only the service key (backend) can insert
-- The Netlify function uses the service_role key, which bypasses RLS
-- This means NO ONE can read or write from the browser directly

-- 4. (Optional) Create a policy for an admin user to read submissions
-- Replace 'your-admin-user-id' with Rehab's Supabase auth user ID
-- CREATE POLICY "Admin can view submissions"
--   ON booking_requests FOR SELECT
--   USING (auth.uid() = 'your-admin-user-id');

-- 5. Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_booking_requests_created_at
  ON booking_requests (created_at DESC);
