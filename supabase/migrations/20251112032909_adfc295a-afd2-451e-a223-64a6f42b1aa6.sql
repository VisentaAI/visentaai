-- Create table for private community invitations
CREATE TABLE public.private_community_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.private_communities(id) ON DELETE CASCADE,
  invited_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email text,
  token text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  accepted_at timestamp with time zone,
  accepted_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Add index for faster lookups
CREATE INDEX idx_invitations_token ON public.private_community_invitations(token);
CREATE INDEX idx_invitations_community ON public.private_community_invitations(community_id);
CREATE INDEX idx_invitations_email ON public.private_community_invitations(email);

-- Enable RLS
ALTER TABLE public.private_community_invitations ENABLE ROW LEVEL SECURITY;

-- Admins can create invitations
CREATE POLICY "Admins can create invitations"
ON public.private_community_invitations
FOR INSERT
WITH CHECK (
  public.is_community_admin(auth.uid(), community_id)
);

-- Admins can view invitations for their communities
CREATE POLICY "Admins can view community invitations"
ON public.private_community_invitations
FOR SELECT
USING (
  public.is_community_admin(auth.uid(), community_id)
);

-- Anyone can view invitations by token (for accepting)
CREATE POLICY "Anyone can view invitations by token"
ON public.private_community_invitations
FOR SELECT
USING (true);

-- Admins can delete invitations
CREATE POLICY "Admins can delete invitations"
ON public.private_community_invitations
FOR DELETE
USING (
  public.is_community_admin(auth.uid(), community_id)
);

-- Anyone can update invitation status (for accepting)
CREATE POLICY "Anyone can update invitation status"
ON public.private_community_invitations
FOR UPDATE
USING (true)
WITH CHECK (true);