-- Drop the restrictive insert policies
DROP POLICY IF EXISTS "Users can add themselves as members" ON public.private_community_members;
DROP POLICY IF EXISTS "Community creators can add admin members" ON public.private_community_members;

-- Create a comprehensive policy that allows:
-- 1. Community creators to add any member
-- 2. Community admins to add any member
CREATE POLICY "Admins and creators can add members"
ON public.private_community_members
FOR INSERT
WITH CHECK (
  -- Allow if user is the community creator
  EXISTS (
    SELECT 1 
    FROM public.private_communities 
    WHERE id = community_id 
    AND created_by = auth.uid()
  )
  OR
  -- Allow if user is already an admin of the community
  public.is_community_admin(auth.uid(), community_id)
  OR
  -- Allow users to add themselves (for accepting invites)
  auth.uid() = user_id
);