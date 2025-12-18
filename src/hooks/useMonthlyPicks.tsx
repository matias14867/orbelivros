import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBooks } from './useBooks';

interface MonthlyPick {
  id: string;
  book_id: string;
  month: number;
  year: number;
  description: string | null;
  created_at: string;
}

export function useMonthlyPicks() {
  const [picks, setPicks] = useState<MonthlyPick[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPicks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('monthly_picks')
        .select('*')
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (error) throw error;
      setPicks(data || []);
    } catch (error) {
      console.error('Error fetching monthly picks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPicks();
  }, [fetchPicks]);

  const addPick = async (bookId: string, month: number, year: number, description?: string) => {
    try {
      const { error } = await supabase
        .from('monthly_picks')
        .insert({ book_id: bookId, month, year, description });

      if (error) throw error;
      await fetchPicks();
      return true;
    } catch (error) {
      console.error('Error adding monthly pick:', error);
      return false;
    }
  };

  const removePick = async (id: string) => {
    try {
      const { error } = await supabase
        .from('monthly_picks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchPicks();
      return true;
    } catch (error) {
      console.error('Error removing monthly pick:', error);
      return false;
    }
  };

  const updateDescription = async (id: string, description: string) => {
    try {
      const { error } = await supabase
        .from('monthly_picks')
        .update({ description })
        .eq('id', id);

      if (error) throw error;
      await fetchPicks();
      return true;
    } catch (error) {
      console.error('Error updating description:', error);
      return false;
    }
  };

  return {
    picks,
    loading,
    addPick,
    removePick,
    updateDescription,
    refetch: fetchPicks,
  };
}

export function useCurrentMonthPicks() {
  const { picks, loading: picksLoading } = useMonthlyPicks();
  const { books, loading: booksLoading } = useBooks();
  
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const currentPicks = picks.filter(
    (p) => p.month === currentMonth && p.year === currentYear
  );

  const picksWithBooks = currentPicks.map((pick) => {
    const book = books.find((b) => b.id === pick.book_id);
    return { ...pick, book };
  }).filter((p) => p.book);

  return {
    picks: picksWithBooks,
    loading: picksLoading || booksLoading,
  };
}
