-- Migrate existing usernames from auth.users metadata to user_usernames table
-- Run this in your Supabase SQL editor

-- First, let's see what users have usernames in their metadata
SELECT 
  id,
  email,
  raw_user_meta_data->>'username' as username
FROM auth.users 
WHERE raw_user_meta_data->>'username' IS NOT NULL;

-- Now insert these into the user_usernames table
INSERT INTO user_usernames (user_id, username, email)
SELECT 
  id,
  raw_user_meta_data->>'username' as username,
  email
FROM auth.users 
WHERE raw_user_meta_data->>'username' IS NOT NULL
  AND raw_user_meta_data->>'username' != ''
ON CONFLICT (username) DO NOTHING;

-- Verify the migration worked
SELECT * FROM user_usernames ORDER BY created_at DESC; 