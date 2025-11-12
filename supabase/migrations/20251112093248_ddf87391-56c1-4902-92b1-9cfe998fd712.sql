-- Create friendships table
CREATE TABLE public.friendships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  friend_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_friendship UNIQUE (user_id, friend_id),
  CONSTRAINT no_self_friendship CHECK (user_id != friend_id),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked'))
);

-- Enable RLS
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own friendships (sent and received)
CREATE POLICY "Users can view their friendships"
ON public.friendships
FOR SELECT
USING (
  auth.uid() = user_id OR auth.uid() = friend_id
);

-- Allow users to create friend requests
CREATE POLICY "Users can send friend requests"
ON public.friendships
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update friend requests sent to them
CREATE POLICY "Users can update friend requests received"
ON public.friendships
FOR UPDATE
USING (auth.uid() = friend_id);

-- Allow users to delete their own friendships
CREATE POLICY "Users can delete their friendships"
ON public.friendships
FOR DELETE
USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Add indexes for better performance
CREATE INDEX idx_friendships_user ON public.friendships(user_id);
CREATE INDEX idx_friendships_friend ON public.friendships(friend_id);
CREATE INDEX idx_friendships_status ON public.friendships(status);