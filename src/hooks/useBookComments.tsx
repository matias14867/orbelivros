import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BookComment {
  id: string;
  book_handle: string;
  user_id: string;
  user_name: string;
  comment: string;
  rating: number | null;
  status: 'pending' | 'approved' | 'rejected';
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  likes_count?: number;
  user_liked?: boolean;
}

export function useBookComments(bookHandle: string) {
  const [comments, setComments] = useState<BookComment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    if (!bookHandle) return;
    
    try {
      const { data: commentsData, error } = await supabase
        .from('book_comments')
        .select('*')
        .eq('book_handle', bookHandle)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch likes for each comment
      const commentsWithLikes = await Promise.all(
        (commentsData || []).map(async (comment) => {
          const { count } = await supabase
            .from('comment_likes')
            .select('*', { count: 'exact', head: true })
            .eq('comment_id', comment.id);

          const { data: session } = await supabase.auth.getSession();
          let userLiked = false;
          
          if (session?.session?.user) {
            const { data: likeData } = await supabase
              .from('comment_likes')
              .select('id')
              .eq('comment_id', comment.id)
              .eq('user_id', session.session.user.id)
              .maybeSingle();
            userLiked = !!likeData;
          }

          return {
            ...comment,
            likes_count: count || 0,
            user_liked: userLiked,
          };
        })
      );

      setComments(commentsWithLikes as BookComment[]);
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
          status: 'pending',
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

  const toggleLike = async (commentId: string, userId: string) => {
    try {
      const comment = comments.find(c => c.id === commentId);
      if (!comment) return { error: new Error('Comment not found') };

      if (comment.user_liked) {
        // Unlike
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', userId);
        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('comment_likes')
          .insert({ comment_id: commentId, user_id: userId });
        if (error) throw error;
      }

      await fetchComments();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  return { comments, loading, addComment, deleteComment, toggleLike, refetch: fetchComments };
}

// Hook for admin to get all comments
export function useAllComments() {
  const [comments, setComments] = useState<(BookComment & { book_title?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllComments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('book_comments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch book titles
      const commentsWithTitles = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: bookData } = await supabase
            .from('books')
            .select('title')
            .eq('handle', comment.book_handle)
            .maybeSingle();

          return {
            ...comment,
            book_title: bookData?.title || comment.book_handle,
          };
        })
      );

      setComments(commentsWithTitles as (BookComment & { book_title?: string })[]);
    } catch (error) {
      console.error('Error fetching all comments:', error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllComments();
  }, [fetchAllComments]);

  const updateCommentStatus = async (commentId: string, status: 'pending' | 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('book_comments')
        .update({ status })
        .eq('id', commentId);

      if (error) throw error;
      await fetchAllComments();
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
      await fetchAllComments();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  return { comments, loading, updateCommentStatus, deleteComment, refetch: fetchAllComments };
}
