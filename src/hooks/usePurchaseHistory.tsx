import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface PurchaseHistoryItem {
  id: string;
  user_id: string;
  order_id: string;
  product_handle: string;
  product_title: string;
  product_image: string | null;
  product_price: number;
  quantity: number;
  purchased_at: string;
}

export function usePurchaseHistory() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<PurchaseHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPurchases = useCallback(async () => {
    if (!user) {
      setPurchases([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('purchase_history')
        .select('*')
        .eq('user_id', user.id)
        .order('purchased_at', { ascending: false });

      if (error) throw error;
      setPurchases(data || []);
    } catch (error) {
      console.error('Error fetching purchase history:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  return {
    purchases,
    loading,
    refetch: fetchPurchases,
  };
}
