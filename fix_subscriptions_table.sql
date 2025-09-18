-- Fix push_subscriptions table for easier testing
-- Run this in your Supabase SQL Editor

-- Drop the existing table and recreate without foreign key constraints
DROP TABLE IF EXISTS public.push_subscriptions;

-- Create simplified table for testing
CREATE TABLE public.push_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,  -- Changed to TEXT for easier testing
    subscription JSONB NOT NULL,
    endpoint TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one subscription per user
    UNIQUE(user_id)
);

-- Create indexes
CREATE INDEX idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);
CREATE INDEX idx_push_subscriptions_endpoint ON public.push_subscriptions(endpoint);

-- DISABLE RLS for testing
ALTER TABLE public.push_subscriptions DISABLE ROW LEVEL SECURITY;

-- Grant full access
GRANT ALL ON public.push_subscriptions TO anon;
GRANT ALL ON public.push_subscriptions TO authenticated;
GRANT ALL ON public.push_subscriptions TO service_role;

-- Create update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_push_subscriptions_updated_at 
    BEFORE UPDATE ON public.push_subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Test the table
SELECT 'Table created successfully!' as status;
