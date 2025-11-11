-- Add is_public column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_public BOOLEAN DEFAULT true NOT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.profiles.is_public IS 'Controls whether the user profile is visible to others in community chat';
