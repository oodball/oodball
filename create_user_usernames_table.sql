-- Create the user_usernames table for username lookup
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS user_usernames (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_user_usernames_username ON user_usernames(username);

-- Create an index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_user_usernames_user_id ON user_usernames(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE user_usernames ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Users can read their own username record
CREATE POLICY "Users can read their own username" ON user_usernames
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own username record
CREATE POLICY "Users can insert their own username" ON user_usernames
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own username record
CREATE POLICY "Users can update their own username" ON user_usernames
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow public read access for username lookups (needed for login)
CREATE POLICY "Public can read usernames for login" ON user_usernames
  FOR SELECT USING (true);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_user_usernames_updated_at 
  BEFORE UPDATE ON user_usernames 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column(); 