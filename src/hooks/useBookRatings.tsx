import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BookRating {
  book_handle: string;
  average_rating: number;
  total_reviews: number;
}

export function useBookRatings() {
  const [ratings, setRatings] = useState<Map<string, BookRating>>(new Map());
  const [loading, setLoading] = useState(true);

  const fetchRatings = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('book_comments')
        .select('book_handle, rating')
        .eq('status', 'approved')
        .not('rating', 'is', null);

      if (error) throw error;

      // Calculate average ratings per book
      const ratingsMap = new Map<string, { total: number; count: number }>();
      
      data?.forEach((comment) => {
        if (comment.rating) {
          const existing = ratingsMap.get(comment.book_handle) || { total: 0, count: 0 };
          ratingsMap.set(comment.book_handle, {
            total: existing.total + comment.rating,
            count: existing.count + 1,
          });
        }
      });

      const result = new Map<string, BookRating>();
      ratingsMap.forEach((value, key) => {
        result.set(key, {
          book_handle: key,
          average_rating: value.total / value.count,
          total_reviews: value.count,
        });
      });

      setRatings(result);
    } catch (error) {
      console.error('Error fetching book ratings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  const getRating = (bookHandle: string): BookRating | undefined => {
    return ratings.get(bookHandle);
  };

  return {
    ratings,
    loading,
    getRating,
    refetch: fetchRatings,
  };
}
