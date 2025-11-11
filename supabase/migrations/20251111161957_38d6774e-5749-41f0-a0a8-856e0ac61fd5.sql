-- Add RLS policy for deleting direct conversations
CREATE POLICY "Users can delete their own conversations"
ON public.direct_conversations
FOR DELETE
USING ((auth.uid() = user1_id) OR (auth.uid() = user2_id));