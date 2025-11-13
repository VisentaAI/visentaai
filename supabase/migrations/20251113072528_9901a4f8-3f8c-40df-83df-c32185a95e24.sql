-- Add CASCADE deletes to ensure deleted users are completely removed from the system

-- Update friendships table to cascade delete
ALTER TABLE public.friendships
DROP CONSTRAINT IF EXISTS friendships_user_id_fkey,
ADD CONSTRAINT friendships_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.profiles(id) 
  ON DELETE CASCADE;

ALTER TABLE public.friendships
DROP CONSTRAINT IF EXISTS friendships_friend_id_fkey,
ADD CONSTRAINT friendships_friend_id_fkey 
  FOREIGN KEY (friend_id) 
  REFERENCES public.profiles(id) 
  ON DELETE CASCADE;

-- Update learning_stats to cascade delete
ALTER TABLE public.learning_stats
DROP CONSTRAINT IF EXISTS learning_stats_user_id_fkey,
ADD CONSTRAINT learning_stats_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.profiles(id) 
  ON DELETE CASCADE;

-- Update learning_progress to cascade delete
ALTER TABLE public.learning_progress
DROP CONSTRAINT IF EXISTS learning_progress_user_id_fkey,
ADD CONSTRAINT learning_progress_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.profiles(id) 
  ON DELETE CASCADE;

-- Update user_statuses to cascade delete
ALTER TABLE public.user_statuses
DROP CONSTRAINT IF EXISTS user_statuses_user_id_fkey,
ADD CONSTRAINT user_statuses_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.profiles(id) 
  ON DELETE CASCADE;

-- Update status_views to cascade delete
ALTER TABLE public.status_views
DROP CONSTRAINT IF EXISTS status_views_viewer_id_fkey,
ADD CONSTRAINT status_views_viewer_id_fkey 
  FOREIGN KEY (viewer_id) 
  REFERENCES public.profiles(id) 
  ON DELETE CASCADE;

-- Update private_community_members to cascade delete
ALTER TABLE public.private_community_members
DROP CONSTRAINT IF EXISTS private_community_members_user_id_fkey,
ADD CONSTRAINT private_community_members_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.profiles(id) 
  ON DELETE CASCADE;

-- Update private_communities created_by to cascade delete communities when creator is deleted
ALTER TABLE public.private_communities
DROP CONSTRAINT IF EXISTS private_communities_created_by_fkey,
ADD CONSTRAINT private_communities_created_by_fkey 
  FOREIGN KEY (created_by) 
  REFERENCES public.profiles(id) 
  ON DELETE CASCADE;

-- Update chat_conversations to cascade delete
ALTER TABLE public.chat_conversations
DROP CONSTRAINT IF EXISTS chat_conversations_user_id_fkey,
ADD CONSTRAINT chat_conversations_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.profiles(id) 
  ON DELETE CASCADE;

-- Update direct_conversations to cascade delete
ALTER TABLE public.direct_conversations
DROP CONSTRAINT IF EXISTS direct_conversations_user1_id_fkey,
ADD CONSTRAINT direct_conversations_user1_id_fkey 
  FOREIGN KEY (user1_id) 
  REFERENCES public.profiles(id) 
  ON DELETE CASCADE;

ALTER TABLE public.direct_conversations
DROP CONSTRAINT IF EXISTS direct_conversations_user2_id_fkey,
ADD CONSTRAINT direct_conversations_user2_id_fkey 
  FOREIGN KEY (user2_id) 
  REFERENCES public.profiles(id) 
  ON DELETE CASCADE;

-- Update direct_messages sender to cascade delete
ALTER TABLE public.direct_messages
DROP CONSTRAINT IF EXISTS direct_messages_sender_id_fkey,
ADD CONSTRAINT direct_messages_sender_id_fkey 
  FOREIGN KEY (sender_id) 
  REFERENCES public.profiles(id) 
  ON DELETE CASCADE;

-- Update community_messages to cascade delete
ALTER TABLE public.community_messages
DROP CONSTRAINT IF EXISTS community_messages_user_id_fkey,
ADD CONSTRAINT community_messages_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.profiles(id) 
  ON DELETE CASCADE;

-- Update private_community_messages to cascade delete
ALTER TABLE public.private_community_messages
DROP CONSTRAINT IF EXISTS private_community_messages_sender_id_fkey,
ADD CONSTRAINT private_community_messages_sender_id_fkey 
  FOREIGN KEY (sender_id) 
  REFERENCES public.profiles(id) 
  ON DELETE CASCADE;

-- Update lessons author to cascade delete lessons when author is deleted
ALTER TABLE public.lessons
DROP CONSTRAINT IF EXISTS lessons_author_id_fkey,
ADD CONSTRAINT lessons_author_id_fkey 
  FOREIGN KEY (author_id) 
  REFERENCES public.profiles(id) 
  ON DELETE CASCADE;

-- Update message reactions to cascade delete
ALTER TABLE public.community_message_reactions
DROP CONSTRAINT IF EXISTS community_message_reactions_user_id_fkey,
ADD CONSTRAINT community_message_reactions_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.profiles(id) 
  ON DELETE CASCADE;

ALTER TABLE public.direct_message_reactions
DROP CONSTRAINT IF EXISTS direct_message_reactions_user_id_fkey,
ADD CONSTRAINT direct_message_reactions_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.profiles(id) 
  ON DELETE CASCADE;

-- Update user_roles to cascade delete
ALTER TABLE public.user_roles
DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey,
ADD CONSTRAINT user_roles_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.profiles(id) 
  ON DELETE CASCADE;

-- Update private_community_invitations to handle deleted users
ALTER TABLE public.private_community_invitations
DROP CONSTRAINT IF EXISTS private_community_invitations_invited_by_fkey,
ADD CONSTRAINT private_community_invitations_invited_by_fkey 
  FOREIGN KEY (invited_by) 
  REFERENCES public.profiles(id) 
  ON DELETE CASCADE;

ALTER TABLE public.private_community_invitations
DROP CONSTRAINT IF EXISTS private_community_invitations_accepted_by_fkey,
ADD CONSTRAINT private_community_invitations_accepted_by_fkey 
  FOREIGN KEY (accepted_by) 
  REFERENCES public.profiles(id) 
  ON DELETE SET NULL;