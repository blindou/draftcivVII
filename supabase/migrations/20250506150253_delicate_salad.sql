/*
  # Create drafts table for Civilization 7 draft sessions

  1. New Tables
    - `drafts`
      - `id` (uuid, primary key)
      - `team_mode` (text) - Stores "2v2", "3v2", "4v4"
      - `enable_souvenir_ban` (boolean)
      - `timer_seconds` (integer)
      - `team1_name` (text)
      - `auto_ban_civilizations` (text[])
      - `auto_ban_leaders` (text[])
      - `auto_ban_souvenirs` (text[])
      - `created_at` (timestamptz)
      - `status` (text) - Draft status

  2. Security
    - Enable RLS on `drafts` table
    - Add policies for reading and creating drafts
*/

CREATE TABLE IF NOT EXISTS drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_mode text NOT NULL CHECK (team_mode IN ('2v2', '3v3', '4v4')),
  enable_souvenir_ban boolean NOT NULL DEFAULT false,
  timer_seconds integer NOT NULL DEFAULT 90,
  team1_name text NOT NULL,
  auto_ban_civilizations text[] NOT NULL DEFAULT '{}',
  auto_ban_leaders text[] NOT NULL DEFAULT '{}',
  auto_ban_souvenirs text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed'))
);

ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drafts are readable by anyone"
  ON drafts
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create drafts"
  ON drafts
  FOR INSERT
  TO public
  WITH CHECK (true);