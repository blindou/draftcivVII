/*
  # Add team2_name column to drafts table

  1. Changes
    - Add `team2_name` column to `drafts` table as nullable
    - This allows drafts to be created without a second team name
    - Team 2 can join later and set their name
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'drafts' AND column_name = 'team2_name'
  ) THEN
    ALTER TABLE drafts ADD COLUMN team2_name text;
  END IF;
END $$;