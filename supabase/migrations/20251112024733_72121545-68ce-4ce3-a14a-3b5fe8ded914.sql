-- Add community_joined_at field to profiles table to track when users first joined community chat
ALTER TABLE public.profiles 
ADD COLUMN community_joined_at timestamp with time zone DEFAULT NULL;

-- Add index for better query performance
CREATE INDEX idx_profiles_community_joined_at ON public.profiles(community_joined_at);