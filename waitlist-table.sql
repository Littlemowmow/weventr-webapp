-- Run this in Supabase SQL Editor to create the waitlist table

CREATE TABLE IF NOT EXISTS waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allow anonymous inserts (landing page doesn't require auth)
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join waitlist" ON waitlist
    FOR INSERT WITH CHECK (true);

-- Only authenticated users can view (admin)
CREATE POLICY "Authenticated users can view waitlist" ON waitlist
    FOR SELECT USING (auth.uid() IS NOT NULL);
