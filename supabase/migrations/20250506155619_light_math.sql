/*
  # Add update policy for drafts table

  1. Changes
    - Add policy to allow updating drafts by anyone
*/

CREATE POLICY "Anyone can update drafts"
  ON drafts
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);