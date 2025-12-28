-- Fix function search path security issue
CREATE OR REPLACE FUNCTION public.cleanup_old_pending_purchases()
RETURNS void AS $$
BEGIN
  DELETE FROM public.pending_purchases 
  WHERE created_at < now() - interval '48 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;