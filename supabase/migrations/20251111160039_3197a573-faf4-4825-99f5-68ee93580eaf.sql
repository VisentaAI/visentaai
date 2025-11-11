-- Add email visibility setting to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email_visible boolean DEFAULT true;