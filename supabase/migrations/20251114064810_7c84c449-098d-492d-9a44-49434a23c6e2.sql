-- Create enum for badge types
CREATE TYPE badge_type AS ENUM ('default', 'verified', 'admin');

-- Add badge_type column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN badge_type badge_type NOT NULL DEFAULT 'default';

-- Create index for better query performance
CREATE INDEX idx_profiles_badge_type ON public.profiles(badge_type);

-- Update existing verified users to have verified badge
UPDATE public.profiles 
SET badge_type = 'verified' 
WHERE verified = true;

-- Update existing admins to have admin badge
UPDATE public.profiles
SET badge_type = 'admin'
WHERE id IN (
  SELECT user_id 
  FROM public.user_roles 
  WHERE role = 'admin'
);

-- Add comment to explain the column
COMMENT ON COLUMN public.profiles.badge_type IS 'Badge type for user verification: default (gray), verified (blue), admin (yellow/gold)';