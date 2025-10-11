-- Fix comment entry_ids after deleting Wanlong Fish Market 
-- The old entry 17 (Wanlong Fish Market) was deleted, but the manifest IDs stayed the same
-- This means any comments for entries that were originally 18+ need to be checked

-- IMPORTANT: Run this in your Supabase SQL Editor
-- Make sure to backup your comments table first!

-- Step 1: Create a backup of comments (optional but recommended)
-- CREATE TABLE comments_backup AS SELECT * FROM comments;

-- Step 2: The current manifest shows:
-- ID 17: Raohe Night Market (file: 17_raohe_night_market.js)
-- ID 18: Izekaya (file: 18_izekaya.js) 
-- ID 19: Hidden City (file: 19_hidden_city.js)
-- ID 20: Teleferic Barcelona (file: 20_teleferic_barcelona.js)

-- If you had comments for the OLD system where:
-- - Wanlong Fish Market was ID 17
-- - Raohe Night Market was ID 18
-- - Izekaya was ID 19
-- - etc.

-- Then you need to shift those comments. But first, let's see what's in the database:

BEGIN;

-- Check current comment distribution (uncomment to run this query first):
-- SELECT entry_id, COUNT(*) as comment_count 
-- FROM comments 
-- WHERE entry_id >= 17
-- GROUP BY entry_id 
-- ORDER BY entry_id;

-- If you see comments with entry_id 18, 19, 20, 21 that should be for 
-- Raohe (17), Izekaya (18), Hidden City (19), Teleferic (20), then run these updates:

-- ONLY run these if you confirm the comments are misaligned:
-- UPDATE comments SET entry_id = 17 WHERE entry_id = 18; -- Raohe comments
-- UPDATE comments SET entry_id = 18 WHERE entry_id = 19; -- Izekaya comments  
-- UPDATE comments SET entry_id = 19 WHERE entry_id = 20; -- Hidden City comments
-- UPDATE comments SET entry_id = 20 WHERE entry_id = 21; -- Teleferic comments

-- Delete any orphaned comments for the deleted Wanlong Fish Market:
-- DELETE FROM comments WHERE entry_id = 17 AND created_at < '2025-10-01';

COMMIT;

-- Step 3: Verify the changes
-- SELECT entry_id, COUNT(*) as comment_count 
-- FROM comments 
-- GROUP BY entry_id 
-- ORDER BY entry_id;
