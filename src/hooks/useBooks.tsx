import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Book {
  id: string;
  title: string;
  author: string | null;
  description: string | null;
  price: number;
  original_price: number | null;
  category: string | null;
  image_url: string | null;
  handle: string;
  in_stock: boolean | null;
  featured: boolean | null;
  created_at: string;
  updated_at: string;
}

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const addBook = async (book: Omit<Book, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('books')
        .insert(book)
        .select()
        .single();

      if (error) throw error;
      await fetchBooks();
      return data;
    } catch (error) {
      console.error('Error adding book:', error);
      throw error;
    }
  };

  const updateBook = async (id: string, updates: Partial<Book>) => {
    try {
      const { error } = await supabase
        .from('books')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await fetchBooks();
    } catch (error) {
      console.error('Error updating book:', error);
      throw error;
    }
  };

  const deleteBook = async (id: string) => {
    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
      throw error;
    }
  };

  return {
    books,
    loading,
    addBook,
    updateBook,
    deleteBook,
    refetch: fetchBooks,
  };
}

export function useBestsellers() {
  const [bestsellers, setBestsellers] = useState<{ handle: string; total_sold: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestsellers = async () => {
      try {
        const { data, error } = await supabase.functions.invoke<
          { handle: string; total_sold: number }[]
        >("get-bestsellers");

        if (error) throw error;
        setBestsellers(data || []);
      } catch (error) {
        console.error("Error fetching bestsellers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBestsellers();
  }, []);

  return { bestsellers, loading };
}