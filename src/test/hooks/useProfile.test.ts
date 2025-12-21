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
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
  })),
};

vi.mock('@/integrations/supabase/client', () => ({ supabase: mockSupabase }));

describe('useProfile Hook', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('deve retornar estrutura correta do hook', async () => {
    const { useProfile } = await import('@/hooks/useProfile');
    const { result } = renderHook(() => useProfile());

    expect(result.current).toHaveProperty('profile');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('updateProfile');
    expect(result.current).toHaveProperty('uploadAvatar');
  });
});
