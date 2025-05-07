/*
  # Add team ready state columns to drafts table

  1. Changes
    - Add `team1_ready` boolean column with default false
    - Add `team2_ready` boolean column with default false

  2. Notes
    - These columns will track the ready state of each team
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'drafts' AND column_name = 'team1_ready'
  ) THEN
    ALTER TABLE drafts ADD COLUMN team1_ready boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'drafts' AND column_name = 'team2_ready'
  ) THEN
    ALTER TABLE drafts ADD COLUMN team2_ready boolean DEFAULT false;
  END IF;
END $$;