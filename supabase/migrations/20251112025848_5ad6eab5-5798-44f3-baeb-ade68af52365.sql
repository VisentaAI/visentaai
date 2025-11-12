-- Drop existing foreign keys that reference auth.users
ALTER TABLE public.private_community_members
  DROP CONSTRAINT IF EXISTS private_community_members_user_id_fkey;

ALTER TABLE public.private_community_messages
  DROP CONSTRAINT IF EXISTS private_community_messages_sender_id_fkey;

-- Add new foreign keys that reference profiles
ALTER TABLE public.private_community_members
  ADD CONSTRAINT private_community_members_user_id_profiles_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.profiles(id) 
  ON DELETE CASCADE;

ALTER TABLE public.private_community_messages
  ADD CONSTRAINT private_community_messages_sender_id_profiles_fkey 
  FOREIGN KEY (sender_id) 
  REFERENCES public.profiles(id) 
  ON DELETE CASCADE;