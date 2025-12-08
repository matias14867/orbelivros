-- Create contacts table for storing customer messages
CREATE TABLE public.contacts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  resolved_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Users can insert contacts (even if not logged in, we allow via anon)
CREATE POLICY "Anyone can insert contacts"
ON public.contacts
FOR INSERT
WITH CHECK (true);

-- Users can view their own contacts
CREATE POLICY "Users can view their own contacts"
ON public.contacts
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all contacts
CREATE POLICY "Admins can view all contacts"
ON public.contacts
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Admins can update contacts (mark as resolved)
CREATE POLICY "Admins can update contacts"
ON public.contacts
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Admins can delete contacts
CREATE POLICY "Admins can delete contacts"
ON public.contacts
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Add DELETE policy for profiles
CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = user_id);

-- Add site_settings table for admin customization
CREATE TABLE public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}',
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can view site settings
CREATE POLICY "Anyone can view site settings"
ON public.site_settings
FOR SELECT
USING (true);

-- Only admins can modify site settings
CREATE POLICY "Admins can insert site settings"
ON public.site_settings
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update site settings"
ON public.site_settings
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Add Fantasia category to books if needed (for filtering)