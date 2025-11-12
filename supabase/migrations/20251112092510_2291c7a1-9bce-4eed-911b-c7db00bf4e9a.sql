-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can add members" ON public.private_community_members;

-- Create a simpler policy that allows users to add themselves
CREATE POLICY "Users can add themselves as members"
ON public.private_community_members
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create a separate policy for community creators to add the first admin member
-- This checks if the user created the community
CREATE POLICY "Community creators can add admin members"
ON public.private_community_members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.private_communities 
    WHERE id = community_id 
    AND created_by = auth.uid()
  )
);