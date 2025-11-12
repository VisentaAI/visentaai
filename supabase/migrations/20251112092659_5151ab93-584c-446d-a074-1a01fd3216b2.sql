-- Drop the problematic SELECT policy
DROP POLICY IF EXISTS "Users can view members of their communities" ON public.private_community_members;

-- Create a security definer function to check community membership
-- This bypasses RLS and prevents recursion
CREATE OR REPLACE FUNCTION public.is_community_member(_user_id uuid, _community_id uuid)
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
  )
$$;

-- Create new SELECT policy using the security definer function
CREATE POLICY "Users can view members of their communities"
ON public.private_community_members
FOR SELECT
USING (
  public.is_community_member(auth.uid(), community_id)
  OR
  -- Also allow if user created the community (for first admin insert)
  EXISTS (
    SELECT 1 
    FROM public.private_communities 
    WHERE id = community_id 
    AND created_by = auth.uid()
  )
);