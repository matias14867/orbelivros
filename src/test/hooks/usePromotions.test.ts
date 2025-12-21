import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: [], error: null }),
  })),
};

vi.mock('@/integrations/supabase/client', () => ({ supabase: mockSupabase }));

describe('usePromotions Hook', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('deve retornar estrutura correta do hook', async () => {
    const { usePromotions } = await import('@/hooks/usePromotions');
    const { result } = renderHook(() => usePromotions());

    expect(result.current).toHaveProperty('promotions');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('createPromotion');
  });
});
