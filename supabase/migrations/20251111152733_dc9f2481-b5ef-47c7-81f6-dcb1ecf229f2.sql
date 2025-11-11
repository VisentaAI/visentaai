-- Allow users to view public profiles
CREATE POLICY "Users can view public profiles"
ON public.profiles
FOR SELECT
USING (is_public = true OR auth.uid() = id);