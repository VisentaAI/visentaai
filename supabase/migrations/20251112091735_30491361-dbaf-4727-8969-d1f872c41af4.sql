-- Create lessons table
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  author_id UUID NOT NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view lessons
CREATE POLICY "Anyone can view lessons"
ON public.lessons
FOR SELECT
USING (true);

-- Allow authenticated users to create lessons
CREATE POLICY "Users can create lessons"
ON public.lessons
FOR INSERT
WITH CHECK (auth.uid() = author_id);

-- Allow users to update their own lessons
CREATE POLICY "Users can update their own lessons"
ON public.lessons
FOR UPDATE
USING (auth.uid() = author_id);

-- Allow users to delete their own lessons
CREATE POLICY "Users can delete their own lessons"
ON public.lessons
FOR DELETE
USING (auth.uid() = author_id);

-- Add index for better performance
CREATE INDEX idx_lessons_author ON public.lessons(author_id);
CREATE INDEX idx_lessons_category ON public.lessons(category);
CREATE INDEX idx_lessons_created_at ON public.lessons(created_at DESC);