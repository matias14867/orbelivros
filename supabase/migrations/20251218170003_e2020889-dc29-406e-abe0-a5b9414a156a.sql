-- Create table for monthly book picks
CREATE TABLE public.monthly_picks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2020),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(book_id, month, year)
);

-- Enable RLS
ALTER TABLE public.monthly_picks ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view monthly picks" 
ON public.monthly_picks 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage monthly picks" 
ON public.monthly_picks 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));
