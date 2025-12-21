import { http, HttpResponse } from 'msw';

const SUPABASE_URL = 'https://meprfpbhzkijctzhvvvb.supabase.co';

// Mock data
export const mockBooks = [
  {
    id: '1',
    handle: 'o-pequeno-principe',
    title: 'O Pequeno Príncipe',
    author: 'Antoine de Saint-Exupéry',
    price: 29.90,
    original_price: 39.90,
    image_url: '/covers/o-pequeno-principe.jpg',
    category: 'Ficção',
    in_stock: true,
    featured: true,
    description: 'Um clássico da literatura mundial',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    handle: 'dom-quixote',
    title: 'Dom Quixote',
    author: 'Miguel de Cervantes',
    price: 45.00,
    original_price: null,
    image_url: '/covers/dom-quixote.jpg',
    category: 'Clássicos',
    in_stock: true,
    featured: false,
    description: 'A obra-prima da literatura espanhola',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const mockBestsellers = [
  { handle: 'o-pequeno-principe', total_sold: 150 },
  { handle: 'dom-quixote', total_sold: 120 },
  { handle: 'harry-potter-1', total_sold: 100 },
];

export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  user_metadata: { full_name: 'Test User' },
};

export const mockProfile = {
  id: 'profile-123',
  user_id: 'user-123',
  full_name: 'Test User',
  phone: '11999999999',
  avatar_url: null,
  address_street: 'Rua Teste',
  address_number: '123',
  address_complement: 'Apto 1',
  address_neighborhood: 'Centro',
  address_city: 'São Paulo',
  address_state: 'SP',
  address_zip: '01000-000',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const mockFavorites = [
  {
    id: 'fav-1',
    user_id: 'user-123',
    product_handle: 'o-pequeno-principe',
    product_title: 'O Pequeno Príncipe',
    product_image: '/covers/o-pequeno-principe.jpg',
    product_price: 29.90,
    created_at: new Date().toISOString(),
  },
];

export const mockPurchaseHistory = [
  {
    id: 'purchase-1',
    user_id: 'user-123',
    order_id: 'order-123',
    product_handle: 'o-pequeno-principe',
    product_title: 'O Pequeno Príncipe',
    product_image: '/covers/o-pequeno-principe.jpg',
    product_price: 29.90,
    quantity: 2,
    purchased_at: new Date().toISOString(),
  },
];

export const mockComments = [
  {
    id: 'comment-1',
    book_handle: 'o-pequeno-principe',
    user_id: 'user-123',
    user_name: 'Test User',
    comment: 'Excelente livro!',
    rating: 5,
    status: 'approved',
    parent_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const mockPromotions = [
  {
    id: 'promo-1',
    title: 'Promoção de Natal',
    description: 'Desconto especial de fim de ano',
    discount_percentage: 20,
    theme_color: '#E91E63',
    is_active: true,
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_by: 'admin-123',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Handlers MSW
export const handlers = [
  // Edge Function: get-bestsellers
  http.get(`${SUPABASE_URL}/functions/v1/get-bestsellers`, () => {
    return HttpResponse.json(mockBestsellers);
  }),

  // Edge Function: delete-user-account
  http.post(`${SUPABASE_URL}/functions/v1/delete-user-account`, async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json() as { userId?: string };
    
    if (!body.userId) {
      return HttpResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    return HttpResponse.json({ success: true });
  }),

  // Supabase REST API: books
  http.get(`${SUPABASE_URL}/rest/v1/books`, ({ request }) => {
    const url = new URL(request.url);
    const select = url.searchParams.get('select');
    
    return HttpResponse.json(mockBooks);
  }),

  // Supabase REST API: profiles
  http.get(`${SUPABASE_URL}/rest/v1/profiles`, () => {
    return HttpResponse.json([mockProfile]);
  }),

  http.patch(`${SUPABASE_URL}/rest/v1/profiles`, () => {
    return HttpResponse.json([mockProfile]);
  }),

  // Supabase REST API: favorites
  http.get(`${SUPABASE_URL}/rest/v1/favorites`, () => {
    return HttpResponse.json(mockFavorites);
  }),

  http.post(`${SUPABASE_URL}/rest/v1/favorites`, () => {
    return HttpResponse.json(mockFavorites[0]);
  }),

  http.delete(`${SUPABASE_URL}/rest/v1/favorites`, () => {
    return HttpResponse.json({});
  }),

  // Supabase REST API: purchase_history
  http.get(`${SUPABASE_URL}/rest/v1/purchase_history`, () => {
    return HttpResponse.json(mockPurchaseHistory);
  }),

  // Supabase REST API: book_comments
  http.get(`${SUPABASE_URL}/rest/v1/book_comments`, () => {
    return HttpResponse.json(mockComments);
  }),

  http.post(`${SUPABASE_URL}/rest/v1/book_comments`, () => {
    return HttpResponse.json(mockComments[0]);
  }),

  // Supabase REST API: promotions
  http.get(`${SUPABASE_URL}/rest/v1/promotions`, () => {
    return HttpResponse.json(mockPromotions);
  }),

  // Supabase REST API: user_roles
  http.get(`${SUPABASE_URL}/rest/v1/user_roles`, () => {
    return HttpResponse.json([{ id: 'role-1', user_id: 'user-123', role: 'user' }]);
  }),

  // Supabase REST API: site_settings
  http.get(`${SUPABASE_URL}/rest/v1/site_settings`, () => {
    return HttpResponse.json([
      { id: '1', key: 'site_texts', value: {}, updated_at: new Date().toISOString() },
      { id: '2', key: 'site_images', value: {}, updated_at: new Date().toISOString() },
    ]);
  }),

  // ViaCEP API
  http.get('https://viacep.com.br/ws/:cep/json/', ({ params }) => {
    const { cep } = params;
    
    if (cep === '01310100') {
      return HttpResponse.json({
        cep: '01310-100',
        logradouro: 'Avenida Paulista',
        complemento: '',
        bairro: 'Bela Vista',
        localidade: 'São Paulo',
        uf: 'SP',
        erro: false,
      });
    }

    return HttpResponse.json({ erro: true });
  }),
];
