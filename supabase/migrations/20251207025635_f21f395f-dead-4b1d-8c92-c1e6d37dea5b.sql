-- Create books table to store all book data
CREATE TABLE public.books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  original_price NUMERIC,
  category TEXT,
  image_url TEXT,
  handle TEXT UNIQUE NOT NULL,
  in_stock BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Everyone can view books (public catalog)
CREATE POLICY "Anyone can view books" 
ON public.books 
FOR SELECT 
USING (true);

-- Only admins can insert books
CREATE POLICY "Admins can insert books" 
ON public.books 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update books
CREATE POLICY "Admins can update books" 
ON public.books 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete books
CREATE POLICY "Admins can delete books" 
ON public.books 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_books_updated_at
BEFORE UPDATE ON public.books
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();