-- Add policy to allow users to update messages in direct conversations
CREATE POLICY "Users can update messages in their conversations"
ON public.direct_messages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.direct_conversations dc
    WHERE dc.id = direct_messages.conversation_id
    AND (dc.user1_id = auth.uid() OR dc.user2_id = auth.uid())
  ) AND sender_id = auth.uid()
);