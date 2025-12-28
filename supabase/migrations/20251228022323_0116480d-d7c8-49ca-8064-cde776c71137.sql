-- Drop the old INSERT policy that requires auth.uid() = user_id
DROP POLICY IF EXISTS "Users can insert their own purchases" ON public.purchase_history;

-- Create a new policy that allows service role to insert purchases
CREATE POLICY "Service role can insert purchases" 
ON public.purchase_history 
FOR INSERT 
WITH CHECK (true);