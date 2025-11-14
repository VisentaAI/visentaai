-- Fix badge privilege escalation vulnerability
-- Drop the insecure policy that allows users to update any column
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Recreate with WITH CHECK clause to prevent badge_type changes
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  -- Ensure badge_type cannot be changed by the user
  badge_type = (SELECT badge_type FROM public.profiles WHERE id = auth.uid())
);

-- Ensure the admin policy remains for badge updates
-- This policy already exists but we verify it's correct
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

CREATE POLICY "Admins can update any profile"
ON public.profiles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));