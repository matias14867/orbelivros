import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  cj_variant_id: string | null;
  title: string;
  sku: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  image_url: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  cj_order_id: string | null;
  status: string;
  payment_status: string;
  payment_method: string | null;
  payment_id: string | null;
  subtotal: number;
  shipping_cost: number;
  total: number;
  currency: string;
  shipping_name: string;
  shipping_email: string | null;
  shipping_phone: string;
  shipping_address: string;
  shipping_address2: string | null;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  shipping_country: string;
  shipping_country_code: string;
  tracking_number: string | null;
  tracking_url: string | null;
  logistic_name: string | null;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export const useUserOrders = () => {
  return useQuery({
    queryKey: ['user-orders'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Order[];
    },
  });
};

export const useOrder = (orderId: string) => {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .eq('id', orderId)
        .single();
      
      if (error) throw error;
      return data as Order;
    },
    enabled: !!orderId,
  });
};

export const useAllOrders = () => {
  return useQuery({
    queryKey: ['all-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Order[];
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['all-orders'] });
      queryClient.invalidateQueries({ queryKey: ['user-orders'] });
    },
  });
};