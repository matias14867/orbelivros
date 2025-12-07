import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Favorite {
  id: string;
  user_id: string;
  product_handle: string;
  product_title: string;
  product_image: string | null;
  product_price: number | null;
  created_at: string;
}

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const addFavorite = async (product: {
    handle: string;
    title: string;
    image?: string;
    price?: number;
  }) => {
    if (!user) {
      toast.error('Faça login para adicionar favoritos');
      return false;
    }

    try {
      const { error } = await supabase.from('favorites').insert({
        user_id: user.id,
        product_handle: product.handle,
        product_title: product.title,
        product_image: product.image || null,
        product_price: product.price || null,
      });

      if (error) {
        if (error.code === '23505') {
          toast.info('Este livro já está nos seus favoritos');
          return false;
        }
        throw error;
      }

      toast.success('Adicionado aos favoritos!');
      await fetchFavorites();
      return true;
    } catch (error) {
      console.error('Error adding favorite:', error);
      toast.error('Erro ao adicionar favorito');
      return false;
    }
  };

  const removeFavorite = async (productHandle: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_handle', productHandle);

      if (error) throw error;

      toast.success('Removido dos favoritos');
      await fetchFavorites();
      return true;
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Erro ao remover favorito');
      return false;
    }
  };

  const isFavorite = (productHandle: string) => {
    return favorites.some((f) => f.product_handle === productHandle);
  };

  const toggleFavorite = async (product: {
    handle: string;
    title: string;
    image?: string;
    price?: number;
  }) => {
    if (isFavorite(product.handle)) {
      return removeFavorite(product.handle);
    } else {
      return addFavorite(product);
    }
  };

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    refetch: fetchFavorites,
  };
}
