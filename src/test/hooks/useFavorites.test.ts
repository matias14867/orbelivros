import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

const mockSupabase = {
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: [], error: null }),
  })),
};

vi.mock('@/integrations/supabase/client', () => ({ supabase: mockSupabase }));

describe('useFavorites Hook', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('deve retornar estrutura correta do hook', async () => {
    const { useFavorites } = await import('@/hooks/useFavorites');
    const { result } = renderHook(() => useFavorites());

    expect(result.current).toHaveProperty('favorites');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('addFavorite');
    expect(result.current).toHaveProperty('removeFavorite');
  });
});
