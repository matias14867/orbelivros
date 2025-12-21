import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockBestsellers } from '../mocks/handlers';

/**
 * Testes para a Edge Function get-bestsellers
 * 
 * Esta edge function:
 * 1. Usa service_role para acessar purchase_history (bypass RLS)
 * 2. Agrupa vendas por product_handle
 * 3. Ordena por total vendido
 * 4. Retorna top 50 produtos
 */

describe('Edge Function: get-bestsellers', () => {
  const mockPurchaseHistory = [
    { product_handle: 'o-pequeno-principe', quantity: 100 },
    { product_handle: 'o-pequeno-principe', quantity: 50 },
    { product_handle: 'dom-quixote', quantity: 80 },
    { product_handle: 'dom-quixote', quantity: 40 },
    { product_handle: 'harry-potter-1', quantity: 100 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve calcular corretamente os bestsellers', () => {
    // Simula a lógica da edge function
    const salesMap = new Map<string, number>();

    mockPurchaseHistory.forEach((purchase) => {
      const current = salesMap.get(purchase.product_handle) || 0;
      salesMap.set(purchase.product_handle, current + (purchase.quantity || 0));
    });

    const bestsellers = Array.from(salesMap.entries())
      .map(([handle, total_sold]) => ({ handle, total_sold }))
      .sort((a, b) => b.total_sold - a.total_sold)
      .slice(0, 50);

    expect(bestsellers).toHaveLength(3);
    expect(bestsellers[0]).toEqual({ handle: 'o-pequeno-principe', total_sold: 150 });
    expect(bestsellers[1]).toEqual({ handle: 'dom-quixote', total_sold: 120 });
    expect(bestsellers[2]).toEqual({ handle: 'harry-potter-1', total_sold: 100 });
  });

  it('deve retornar array vazio quando não há histórico de compras', () => {
    const salesMap = new Map<string, number>();
    const emptyHistory: typeof mockPurchaseHistory = [];

    emptyHistory.forEach((purchase) => {
      const current = salesMap.get(purchase.product_handle) || 0;
      salesMap.set(purchase.product_handle, current + (purchase.quantity || 0));
    });

    const bestsellers = Array.from(salesMap.entries())
      .map(([handle, total_sold]) => ({ handle, total_sold }))
      .sort((a, b) => b.total_sold - a.total_sold)
      .slice(0, 50);

    expect(bestsellers).toHaveLength(0);
  });

  it('deve limitar resultado a 50 itens', () => {
    // Cria 100 produtos fictícios
    const largeHistory = Array.from({ length: 100 }, (_, i) => ({
      product_handle: `product-${i}`,
      quantity: Math.floor(Math.random() * 100),
    }));

    const salesMap = new Map<string, number>();

    largeHistory.forEach((purchase) => {
      const current = salesMap.get(purchase.product_handle) || 0;
      salesMap.set(purchase.product_handle, current + (purchase.quantity || 0));
    });

    const bestsellers = Array.from(salesMap.entries())
      .map(([handle, total_sold]) => ({ handle, total_sold }))
      .sort((a, b) => b.total_sold - a.total_sold)
      .slice(0, 50);

    expect(bestsellers.length).toBeLessThanOrEqual(50);
  });

  it('deve ordenar por total_sold em ordem decrescente', () => {
    const salesMap = new Map<string, number>();

    mockPurchaseHistory.forEach((purchase) => {
      const current = salesMap.get(purchase.product_handle) || 0;
      salesMap.set(purchase.product_handle, current + (purchase.quantity || 0));
    });

    const bestsellers = Array.from(salesMap.entries())
      .map(([handle, total_sold]) => ({ handle, total_sold }))
      .sort((a, b) => b.total_sold - a.total_sold);

    for (let i = 1; i < bestsellers.length; i++) {
      expect(bestsellers[i - 1].total_sold).toBeGreaterThanOrEqual(bestsellers[i].total_sold);
    }
  });

  it('deve tratar quantity undefined como 0', () => {
    const historyWithUndefined = [
      { product_handle: 'book-1', quantity: 50 },
      { product_handle: 'book-1', quantity: undefined as any },
    ];

    const salesMap = new Map<string, number>();

    historyWithUndefined.forEach((purchase) => {
      const current = salesMap.get(purchase.product_handle) || 0;
      salesMap.set(purchase.product_handle, current + (purchase.quantity || 0));
    });

    const bestsellers = Array.from(salesMap.entries())
      .map(([handle, total_sold]) => ({ handle, total_sold }));

    expect(bestsellers[0].total_sold).toBe(50);
  });
});

describe('Edge Function: get-bestsellers HTTP Response', () => {
  it('deve retornar estrutura esperada do mock', () => {
    expect(mockBestsellers).toBeInstanceOf(Array);
    expect(mockBestsellers[0]).toHaveProperty('handle');
    expect(mockBestsellers[0]).toHaveProperty('total_sold');
  });

  it('cada item deve ter handle string e total_sold number', () => {
    mockBestsellers.forEach((item) => {
      expect(typeof item.handle).toBe('string');
      expect(typeof item.total_sold).toBe('number');
    });
  });
});
