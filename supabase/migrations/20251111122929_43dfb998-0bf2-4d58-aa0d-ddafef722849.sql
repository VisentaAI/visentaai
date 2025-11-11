-- Create direct_conversations table
CREATE TABLE IF NOT EXISTS public.direct_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT different_users CHECK (user1_id != user2_id),
  CONSTRAINT ordered_users CHECK (user1_id < user2_id)
);

-- Create index for faster lookups
CREATE INDEX idx_direct_conversations_users ON public.direct_conversations(user1_id, user2_id);

-- Create direct_messages table
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.direct_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster message retrieval
CREATE INDEX idx_direct_messages_conversation ON public.direct_messages(conversation_id, created_at);
CREATE INDEX idx_direct_messages_unread ON public.direct_messages(conversation_id, read) WHERE read = false;

-- Enable RLS
ALTER TABLE public.direct_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for direct_conversations
-- Users can view conversations they're part of
CREATE POLICY "Users can view their own conversations"
ON public.direct_conversations FOR SELECT
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Users can create conversations
CREATE POLICY "Users can create conversations"
ON public.direct_conversations FOR INSERT
WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Users can update conversations they're part of
CREATE POLICY "Users can update their own conversations"
ON public.direct_conversations FOR UPDATE
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- RLS policies for direct_messages
-- Users can view messages from their conversations
CREATE POLICY "Users can view messages from their conversations"
ON public.direct_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.direct_conversations
    WHERE id = conversation_id
    AND (user1_id = auth.uid() OR user2_id = auth.uid())
  )
);

-- Users can send messages in their conversations
CREATE POLICY "Users can send messages in their conversations"
ON public.direct_messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM public.direct_conversations
    WHERE id = conversation_id
    AND (user1_id = auth.uid() OR user2_id = auth.uid())
  )
);

-- Users can update their own messages
CREATE POLICY "Users can update their own messages"
ON public.direct_messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.direct_conversations
    WHERE id = conversation_id
    AND (user1_id = auth.uid() OR user2_id = auth.uid())
  )
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;

-- Function to update conversation timestamp when new message is sent
CREATE OR REPLACE FUNCTION public.update_direct_conversation_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.direct_conversations
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

-- Trigger to update conversation timestamp
CREATE TRIGGER update_direct_conversation_timestamp
AFTER INSERT ON public.direct_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_direct_conversation_timestamp();

-- Function to get or create conversation between two users
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(other_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conversation_id UUID;
  current_user_id UUID;
  user1 UUID;
  user2 UUID;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  IF current_user_id = other_user_id THEN
    RAISE EXCEPTION 'Cannot create conversation with yourself';
  END IF;
  
  -- Order user IDs to ensure consistency
  IF current_user_id < other_user_id THEN
    user1 := current_user_id;
    user2 := other_user_id;
  ELSE
    user1 := other_user_id;
    user2 := current_user_id;
  END IF;
  
  -- Try to find existing conversation
  SELECT id INTO conversation_id
  FROM public.direct_conversations
  WHERE user1_id = user1 AND user2_id = user2;
  
  -- Create if doesn't exist
  IF conversation_id IS NULL THEN
    INSERT INTO public.direct_conversations (user1_id, user2_id)
    VALUES (user1, user2)
    RETURNING id INTO conversation_id;
  END IF;
  
  RETURN conversation_id;
END;
$$;