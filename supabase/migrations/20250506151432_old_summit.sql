/*
  # Add draft actions table

  1. New Tables
    - `draft_actions`
      - `id` (uuid, primary key)
      - `draft_id` (uuid, references drafts)
      - `action_type` (text) - 'ban' or 'pick'
      - `team_number` (integer) - 1 or 2
      - `choice_id` (text) - ID of the chosen entity
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `draft_actions` table
    - Add policies for reading and creating actions
*/

CREATE TABLE IF NOT EXISTS draft_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id uuid NOT NULL REFERENCES drafts(id),
  action_type text NOT NULL CHECK (action_type IN ('ban', 'pick')),
  team_number integer NOT NULL CHECK (team_number IN (1, 2)),
  choice_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE draft_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Draft actions are readable by anyone"
  ON draft_actions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create draft actions"
  ON draft_actions
  FOR INSERT
  TO public
  WITH CHECK (true);