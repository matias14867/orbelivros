-- Create pending_purchases table to store checkout data until payment is confirmed
CREATE TABLE public.pending_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reference_id TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  items JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pending_purchases ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own pending purchases
CREATE POLICY "Users can view own pending purchases" 
ON public.pending_purchases 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Service role can insert (from edge function)
CREATE POLICY "Service role can insert pending purchases" 
ON public.pending_purchases 
FOR INSERT 
WITH CHECK (true);

-- Policy: Service role can delete (from edge function)
CREATE POLICY "Service role can delete pending purchases" 
ON public.pending_purchases 
FOR DELETE 
USING (true);

-- Index for faster lookups
CREATE INDEX idx_pending_purchases_reference_id ON public.pending_purchases(reference_id);

-- Auto-cleanup: Delete pending purchases older than 48 hours
CREATE OR REPLACE FUNCTION public.cleanup_old_pending_purchases()
RETURNS void AS $$
BEGIN
  DELETE FROM public.pending_purchases 
  WHERE created_at < now() - interval '48 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;