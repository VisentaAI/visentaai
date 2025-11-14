-- Drop old private community tables
DROP TABLE IF EXISTS public.private_community_invitations CASCADE;
DROP TABLE IF EXISTS public.private_community_messages CASCADE;
DROP TABLE IF EXISTS public.private_community_members CASCADE;
DROP TABLE IF EXISTS public.private_communities CASCADE;

-- Create groups table (similar to WhatsApp groups)
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create group members table
CREATE TABLE public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create group messages table
CREATE TABLE public.group_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create group invitations table
CREATE TABLE public.group_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  accepted_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  email TEXT,
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all tables
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_invitations ENABLE ROW LEVEL SECURITY;

-- Helper functions
CREATE OR REPLACE FUNCTION public.is_group_member(_user_id UUID, _group_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE user_id = _user_id
      AND group_id = _group_id
  )
$$;

CREATE OR REPLACE FUNCTION public.is_group_admin(_user_id UUID, _group_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE user_id = _user_id
      AND group_id = _group_id
      AND role = 'admin'
  )
$$;

-- RLS Policies for groups
CREATE POLICY "Users can view groups they are members of"
  ON public.groups FOR SELECT
  USING (is_group_member(auth.uid(), id));

CREATE POLICY "Users can create their own groups"
  ON public.groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update their groups"
  ON public.groups FOR UPDATE
  USING (is_group_admin(auth.uid(), id));

CREATE POLICY "Admins can delete their groups"
  ON public.groups FOR DELETE
  USING (is_group_admin(auth.uid(), id));

-- RLS Policies for group_members
CREATE POLICY "Users can view members of their groups"
  ON public.group_members FOR SELECT
  USING (is_group_member(auth.uid(), group_id) OR 
         EXISTS (SELECT 1 FROM public.groups WHERE id = group_id AND created_by = auth.uid()));

CREATE POLICY "Admins and creators can add members"
  ON public.group_members FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.groups WHERE id = group_id AND created_by = auth.uid()) OR
    is_group_admin(auth.uid(), group_id) OR
    auth.uid() = user_id
  );

CREATE POLICY "Admins can update member roles"
  ON public.group_members FOR UPDATE
  USING (is_group_admin(auth.uid(), group_id));

CREATE POLICY "Admins can remove members"
  ON public.group_members FOR DELETE
  USING (is_group_admin(auth.uid(), group_id));

-- RLS Policies for group_messages
CREATE POLICY "Members can view messages in their groups"
  ON public.group_messages FOR SELECT
  USING (is_group_member(auth.uid(), group_id));

CREATE POLICY "Members can send messages"
  ON public.group_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    is_group_member(auth.uid(), group_id)
  );

CREATE POLICY "Users can update their own messages"
  ON public.group_messages FOR UPDATE
  USING (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own messages"
  ON public.group_messages FOR DELETE
  USING (auth.uid() = sender_id);

-- RLS Policies for group_invitations
CREATE POLICY "Admins can view group invitations"
  ON public.group_invitations FOR SELECT
  USING (is_group_admin(auth.uid(), group_id));

CREATE POLICY "Anyone can view invitations by token"
  ON public.group_invitations FOR SELECT
  USING (true);

CREATE POLICY "Admins can create invitations"
  ON public.group_invitations FOR INSERT
  WITH CHECK (is_group_admin(auth.uid(), group_id));

CREATE POLICY "Anyone can update invitation status"
  ON public.group_invitations FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete invitations"
  ON public.group_invitations FOR DELETE
  USING (is_group_admin(auth.uid(), group_id));

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_group_timestamp()
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

CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_group_timestamp();

CREATE TRIGGER update_group_messages_updated_at
  BEFORE UPDATE ON public.group_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_group_timestamp();

-- Enable realtime for group messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;