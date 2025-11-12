-- Create a security definer function to check if user is admin in a community
-- This prevents infinite recursion in RLS policies
CREATE OR REPLACE FUNCTION public.is_community_admin(_user_id uuid, _community_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.private_community_members
    WHERE user_id = _user_id
      AND community_id = _community_id
      AND role = 'admin'
  )
$$;

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Admins can add members" ON public.private_community_members;
DROP POLICY IF EXISTS "Admins can remove members" ON public.private_community_members;
DROP POLICY IF EXISTS "Admins can update member roles" ON public.private_community_members;

-- Recreate policies using the security definer function
CREATE POLICY "Admins can add members"
ON public.private_community_members
FOR INSERT
WITH CHECK (
  public.is_community_admin(auth.uid(), community_id) OR auth.uid() = user_id
);

CREATE POLICY "Admins can remove members"
ON public.private_community_members
FOR DELETE
USING (
  public.is_community_admin(auth.uid(), community_id)
);

CREATE POLICY "Admins can update member roles"
ON public.private_community_members
FOR UPDATE
USING (
  public.is_community_admin(auth.uid(), community_id)
);