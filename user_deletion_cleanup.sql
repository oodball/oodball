-- Additional cleanup triggers for user deletion
-- Run this in your Supabase SQL editor

-- Function to handle additional cleanup when a user is deleted
CREATE OR REPLACE FUNCTION handle_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
    -- Clean up comments by this user
    -- Option 1: Delete all comments by the deleted user
    DELETE FROM comments WHERE user_id = OLD.id;
    
    -- Option 2: Or anonymize comments instead of deleting them
    -- UPDATE comments 
    -- SET username = 'deleted_user', 
    --     author = 'deleted@example.com',
    --     user_id = NULL
    -- WHERE user_id = OLD.id;
    
    -- Clean up any other user-related data
    -- DELETE FROM user_preferences WHERE user_id = OLD.id;
    -- DELETE FROM user_sessions WHERE user_id = OLD.id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on auth.users to handle additional cleanup
-- Note: This trigger runs BEFORE the deletion, so we can access OLD.id
CREATE TRIGGER handle_user_deletion_trigger
    BEFORE DELETE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_user_deletion();

-- Alternative: If you want to log user deletions
CREATE TABLE IF NOT EXISTS user_deletion_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    deleted_user_id UUID NOT NULL,
    deleted_email TEXT,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_by UUID -- if you want to track who deleted the user
);

-- Function to log user deletions
CREATE OR REPLACE FUNCTION log_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_deletion_log (deleted_user_id, deleted_email)
    VALUES (OLD.id, OLD.email);
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger to log user deletions
CREATE TRIGGER log_user_deletion_trigger
    AFTER DELETE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION log_user_deletion(); 