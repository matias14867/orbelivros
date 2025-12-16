-- Add status column for moderation
ALTER TABLE public.book_comments 
ADD COLUMN status TEXT NOT NULL DEFAULT 'pending' 
CHECK (status IN ('pending', 'approved', 'rejected'));

-- Add parent_id for replies (future use with email notifications)
ALTER TABLE public.book_comments 
ADD COLUMN parent_id UUID REFERENCES public.book_comments(id) ON DELETE CASCADE;

-- Create comment_likes table
CREATE TABLE public.comment_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES public.book_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Enable RLS
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- Anyone can view likes
CREATE POLICY "Anyone can view comment likes"
ON public.comment_likes
FOR SELECT
USING (true);

-- Users can insert their own likes
CREATE POLICY "Users can like comments"
ON public.comment_likes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can remove their own likes
CREATE POLICY "Users can unlike comments"
ON public.comment_likes
FOR DELETE
USING (auth.uid() = user_id);

-- Update book_comments SELECT policy to only show approved comments (unless admin)
DROP POLICY IF EXISTS "Anyone can view book comments" ON public.book_comments;

CREATE POLICY "Users can view approved comments or their own"
ON public.book_comments
FOR SELECT
USING (
  status = 'approved' 
  OR auth.uid() = user_id 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Admin can update any comment (for moderation)
CREATE POLICY "Admins can update any comment"
ON public.book_comments
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));