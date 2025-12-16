import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BookComment {
  id: string;
  book_handle: string;
  user_id: string;
  user_name: string;
  comment: string;
  rating: number | null;
  created_at: string;
  updated_at: string;
}

export function useBookComments(bookHandle: string) {
  const [comments, setComments] = useState<BookComment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    if (!bookHandle) return;
    
    try {
      const { data, error } = await supabase
        .from('book_comments')
        .select('*')
        .eq('book_handle', bookHandle)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [bookHandle]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = async (userId: string, userName: string, comment: string, rating?: number) => {
    try {
      const { error } = await supabase
        .from('book_comments')
        .insert({
          book_handle: bookHandle,
          user_id: userId,
          user_name: userName,
          comment,
          rating: rating || null,
        });

      if (error) throw error;
      await fetchComments();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('book_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      await fetchComments();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  return { comments, loading, addComment, deleteComment, refetch: fetchComments };
}
