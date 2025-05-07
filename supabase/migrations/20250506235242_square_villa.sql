/*
  # Add category column to draft_actions table

  1. Changes
    - Add `category` column to `draft_actions` table
    - Set default value to 'civ' for existing rows
    - Add NOT NULL constraint
    - Add check constraint for valid categories

  2. Notes
    - Categories: 'civ', 'leader', 'souvenir'
    - All existing rows will have 'civ' as category
*/

-- First add the column as nullable with a default
ALTER TABLE draft_actions 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'civ';

-- Update any existing rows to have the default value
UPDATE draft_actions 
SET category = 'civ' 
WHERE category IS NULL;

-- Now make it NOT NULL
ALTER TABLE draft_actions 
ALTER COLUMN category SET NOT NULL;

-- Add the check constraint
ALTER TABLE draft_actions 
ADD CONSTRAINT draft_actions_category_check 
CHECK (category = ANY (ARRAY['civ'::text, 'leader'::text, 'souvenir'::text]));