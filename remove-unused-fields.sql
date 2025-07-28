-- Remove unused fields from database
-- This script removes showStartButton and showAnswerImages fields

-- Remove showStartButton from quizzes table
ALTER TABLE quizzes DROP COLUMN IF EXISTS show_start_button;

-- Remove showAnswerImages from questions table  
ALTER TABLE questions DROP COLUMN IF EXISTS show_answer_images;

-- Clean up any remaining references in existing data
-- (Optional: Add any data cleanup queries if needed)

-- Note: Run this script after deploying the code changes
-- Make sure to backup your database before running this migration