-- Create statuses table
CREATE TABLE public.user_statuses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT,
  media_url TEXT,
  media_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  view_count INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.user_statuses ENABLE ROW LEVEL SECURITY;

-- Policies for statuses
CREATE POLICY "Anyone can view non-expired statuses"
  ON public.user_statuses
  FOR SELECT
  USING (expires_at > NOW());

CREATE POLICY "Users can create their own statuses"
  ON public.user_statuses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own statuses"
  ON public.user_statuses
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own statuses"
  ON public.user_statuses
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create status views table to track who viewed which status
CREATE TABLE public.status_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  status_id UUID NOT NULL REFERENCES public.user_statuses(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(status_id, viewer_id)
);

-- Enable RLS
ALTER TABLE public.status_views ENABLE ROW LEVEL SECURITY;

-- Policies for status views
CREATE POLICY "Users can view their own status views"
  ON public.status_views
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_statuses
      WHERE user_statuses.id = status_views.status_id
      AND user_statuses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create status views"
  ON public.status_views
  FOR INSERT
  WITH CHECK (auth.uid() = viewer_id);

-- Create storage bucket for status media
INSERT INTO storage.buckets (id, name, public)
VALUES ('statuses', 'statuses', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for status media
CREATE POLICY "Anyone can view status media"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'statuses');

CREATE POLICY "Users can upload their own status media"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'statuses' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own status media"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'statuses' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Enable realtime for statuses
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_statuses;