import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { mockBooks } from '../mocks/handlers';

const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: mockBooks, error: null }),
  })),
  functions: {
    invoke: vi.fn().mockResolvedValue({ data: [], error: null }),
  },
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

describe('useBooks Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar estrutura correta do hook', async () => {
    const { useBooks } = await import('@/hooks/useBooks');
    const { result } = renderHook(() => useBooks());

    expect(result.current).toHaveProperty('books');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('addBook');
    expect(result.current).toHaveProperty('updateBook');
    expect(result.current).toHaveProperty('deleteBook');
  });
});
