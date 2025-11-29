-- Add description column to teams table
ALTER TABLE public.teams ADD COLUMN description TEXT;

-- Update teams schema with description
COMMENT ON COLUMN public.teams.description IS 'Team description';
