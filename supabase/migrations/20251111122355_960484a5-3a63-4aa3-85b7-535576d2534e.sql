-- Create community_messages table for public chat
CREATE TABLE IF NOT EXISTS public.community_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;

-- Everyone can read community messages
CREATE POLICY "Anyone can view community messages"
ON public.community_messages FOR SELECT
USING (true);

-- Authenticated users can insert their own messages
CREATE POLICY "Users can create community messages"
ON public.community_messages FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own messages
CREATE POLICY "Users can update their own messages"
ON public.community_messages FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own messages
CREATE POLICY "Users can delete their own messages"
ON public.community_messages FOR DELETE
USING (auth.uid() = user_id);

-- Enable realtime for community messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;

-- Function to update timestamp
CREATE OR REPLACE FUNCTION public.update_community_message_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger to update timestamp
CREATE TRIGGER update_community_message_timestamp
BEFORE UPDATE ON public.community_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_community_message_timestamp();