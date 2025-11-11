-- Create message reactions tables
CREATE TABLE public.community_message_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.community_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

CREATE TABLE public.direct_message_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.direct_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- Enable RLS
ALTER TABLE public.community_message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_message_reactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for community reactions
CREATE POLICY "Anyone can view community reactions"
ON public.community_message_reactions
FOR SELECT
USING (true);

CREATE POLICY "Users can add their own reactions"
ON public.community_message_reactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions"
ON public.community_message_reactions
FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for direct message reactions
CREATE POLICY "Users can view reactions in their conversations"
ON public.direct_message_reactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.direct_messages dm
    JOIN public.direct_conversations dc ON dm.conversation_id = dc.id
    WHERE dm.id = direct_message_reactions.message_id
    AND (dc.user1_id = auth.uid() OR dc.user2_id = auth.uid())
  )
);

CREATE POLICY "Users can add reactions to messages in their conversations"
ON public.direct_message_reactions
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.direct_messages dm
    JOIN public.direct_conversations dc ON dm.conversation_id = dc.id
    WHERE dm.id = direct_message_reactions.message_id
    AND (dc.user1_id = auth.uid() OR dc.user2_id = auth.uid())
  )
);

CREATE POLICY "Users can delete their own reactions"
ON public.direct_message_reactions
FOR DELETE
USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_message_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_message_reactions;