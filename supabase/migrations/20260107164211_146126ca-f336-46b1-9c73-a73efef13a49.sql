-- ===========================================
-- DROPSHIPPING STRUCTURE FOR CJ DROPSHIPPING
-- ===========================================

-- Drop old book-related tables (keeping purchase_history for reference)
DROP TABLE IF EXISTS monthly_picks CASCADE;
DROP TABLE IF EXISTS promotion_books CASCADE;
DROP TABLE IF EXISTS promotions CASCADE;
DROP TABLE IF EXISTS book_comments CASCADE;
DROP TABLE IF EXISTS comment_likes CASCADE;

-- Create new products table for dropshipping
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cj_product_id VARCHAR(100) UNIQUE,
  cj_variant_id VARCHAR(100),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  handle VARCHAR(255) UNIQUE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  currency VARCHAR(10) DEFAULT 'BRL',
  image_url TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  sku VARCHAR(100),
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  weight DECIMAL(10,2),
  cj_category_id VARCHAR(50),
  supplier_name VARCHAR(100) DEFAULT 'CJ Dropshipping',
  shipping_time VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create orders table for dropshipping
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  cj_order_id VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_id VARCHAR(100),
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'BRL',
  -- Shipping info
  shipping_name VARCHAR(200) NOT NULL,
  shipping_email VARCHAR(255),
  shipping_phone VARCHAR(50) NOT NULL,
  shipping_address VARCHAR(500) NOT NULL,
  shipping_address2 VARCHAR(200),
  shipping_city VARCHAR(100) NOT NULL,
  shipping_state VARCHAR(100) NOT NULL,
  shipping_zip VARCHAR(20) NOT NULL,
  shipping_country VARCHAR(100) DEFAULT 'Brasil',
  shipping_country_code VARCHAR(5) DEFAULT 'BR',
  -- Tracking
  tracking_number VARCHAR(100),
  tracking_url TEXT,
  logistic_name VARCHAR(100),
  -- Timestamps
  paid_at TIMESTAMP WITH TIME ZONE,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create order items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  cj_variant_id VARCHAR(100),
  title VARCHAR(500) NOT NULL,
  sku VARCHAR(100),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create CJ sync log for tracking imports
CREATE TABLE public.cj_sync_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sync_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  products_synced INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]'::jsonb,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_cj_product_id ON public.products(cj_product_id);
CREATE INDEX idx_products_handle ON public.products(handle);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_cj_order_id ON public.orders(cj_order_id);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cj_sync_log ENABLE ROW LEVEL SECURITY;

-- Products policies (public read, admin write)
CREATE POLICY "Products are viewable by everyone" 
ON public.products FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage products" 
ON public.products FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Orders policies (users see own, admins see all)
CREATE POLICY "Users can view their own orders" 
ON public.orders FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" 
ON public.orders FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all orders" 
ON public.orders FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Order items policies
CREATE POLICY "Users can view their own order items" 
ON public.order_items FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all order items" 
ON public.order_items FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Sync log (admin only)
CREATE POLICY "Admins can manage sync log" 
ON public.cj_sync_log FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Update trigger for products
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update trigger for orders
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(NEW.id::text, 1, 8);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_order_number
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.generate_order_number();