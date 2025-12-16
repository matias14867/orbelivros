import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Promotion {
  id: string;
  title: string;
  description: string | null;
  discount_percentage: number;
  theme_color: string | null;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface PromotionBook {
  id: string;
  promotion_id: string;
  book_id: string;
  created_at: string;
}

export function usePromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPromotions = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromotions(data || []);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const createPromotion = async (promotion: Omit<Promotion, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('promotions')
      .insert(promotion)
      .select()
      .single();

    if (error) throw error;
    await fetchPromotions();
    return data;
  };

  const updatePromotion = async (id: string, updates: Partial<Promotion>) => {
    const { error } = await supabase
      .from('promotions')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    await fetchPromotions();
  };

  const deletePromotion = async (id: string) => {
    const { error } = await supabase
      .from('promotions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchPromotions();
  };

  const getPromotionBooks = async (promotionId: string) => {
    const { data, error } = await supabase
      .from('promotion_books')
      .select('book_id')
      .eq('promotion_id', promotionId);

    if (error) throw error;
    return data?.map(pb => pb.book_id) || [];
  };

  const setPromotionBooks = async (promotionId: string, bookIds: string[]) => {
    // Remove existing books
    await supabase
      .from('promotion_books')
      .delete()
      .eq('promotion_id', promotionId);

    // Add new books
    if (bookIds.length > 0) {
      const { error } = await supabase
        .from('promotion_books')
        .insert(bookIds.map(bookId => ({
          promotion_id: promotionId,
          book_id: bookId,
        })));

      if (error) throw error;
    }
  };

  return {
    promotions,
    loading,
    createPromotion,
    updatePromotion,
    deletePromotion,
    getPromotionBooks,
    setPromotionBooks,
    refetch: fetchPromotions,
  };
}

export function useActivePromotion() {
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [promotionBooks, setPromotionBooks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivePromotion = async () => {
      try {
        const { data: promotionData, error: promotionError } = await supabase
          .from('promotions')
          .select('*')
          .eq('is_active', true)
          .maybeSingle();

        if (promotionError) throw promotionError;
        
        if (promotionData) {
          setPromotion(promotionData);

          const { data: booksData, error: booksError } = await supabase
            .from('promotion_books')
            .select('book_id')
            .eq('promotion_id', promotionData.id);

          if (booksError) throw booksError;
          setPromotionBooks(booksData?.map(pb => pb.book_id) || []);
        }
      } catch (error) {
        console.error('Error fetching active promotion:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivePromotion();
  }, []);

  return { promotion, promotionBooks, loading };
}
