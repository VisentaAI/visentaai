-- Create private communities table
CREATE TABLE public.private_communities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create private community members table
CREATE TABLE public.private_community_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES public.private_communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(community_id, user_id)
);

-- Create private community messages table
CREATE TABLE public.private_community_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES public.private_communities(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.private_communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_community_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for private_communities
CREATE POLICY "Users can view communities they are members of"
  ON public.private_communities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.private_community_members
      WHERE community_id = private_communities.id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own communities"
  ON public.private_communities FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update their communities"
  ON public.private_communities FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.private_community_members
      WHERE community_id = private_communities.id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete their communities"
  ON public.private_communities FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.private_community_members
      WHERE community_id = private_communities.id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- RLS Policies for private_community_members
CREATE POLICY "Users can view members of their communities"
  ON public.private_community_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.private_community_members pcm
      WHERE pcm.community_id = private_community_members.community_id
      AND pcm.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can add members"
  ON public.private_community_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.private_community_members
      WHERE community_id = private_community_members.community_id
      AND user_id = auth.uid()
      AND role = 'admin'
    ) OR auth.uid() = user_id
  );

CREATE POLICY "Admins can remove members"
  ON public.private_community_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.private_community_members
      WHERE community_id = private_community_members.community_id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update member roles"
  ON public.private_community_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.private_community_members
      WHERE community_id = private_community_members.community_id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- RLS Policies for private_community_messages
CREATE POLICY "Members can view messages in their communities"
  ON public.private_community_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.private_community_members
      WHERE community_id = private_community_messages.community_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Members can send messages"
  ON public.private_community_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.private_community_members
      WHERE community_id = private_community_messages.community_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages"
  ON public.private_community_messages FOR UPDATE
  USING (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own messages"
  ON public.private_community_messages FOR DELETE
  USING (auth.uid() = sender_id);

-- Create trigger for updating timestamps
CREATE OR REPLACE FUNCTION public.update_private_community_timestamp()
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

CREATE TRIGGER update_private_communities_timestamp
  BEFORE UPDATE ON public.private_communities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_private_community_timestamp();

CREATE TRIGGER update_private_community_messages_timestamp
  BEFORE UPDATE ON public.private_community_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_private_community_timestamp();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.private_community_messages;