-- Update RLS for purchase_history so only admins can edit/delete and admins can view all
DROP POLICY IF EXISTS "Users can view their own purchase history" ON public.purchase_history;

CREATE POLICY "Users can view their own purchase history"
ON public.purchase_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all purchase history"
ON public.purchase_history
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update purchase history"
ON public.purchase_history
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete purchase history"
ON public.purchase_history
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to insert profiles for test data while keeping normal users restricted to their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all profiles while regular users only see their own
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));