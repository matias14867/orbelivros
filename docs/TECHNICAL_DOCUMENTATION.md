# Documentação Técnica - Orbe Livros

## Índice

1. [Arquitetura Geral](#arquitetura-geral)
2. [Banco de Dados (Supabase)](#banco-de-dados-supabase)
3. [Edge Functions](#edge-functions)
4. [Hooks React](#hooks-react)
5. [Stores (Zustand)](#stores-zustand)
6. [Integrações](#integrações)

---

## Arquitetura Geral

O site utiliza uma arquitetura híbrida combinando:
- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **E-commerce**: Shopify Storefront API
- **Estado Global**: Zustand (carrinho de compras)

### Fluxo de Dados

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│  Supabase   │────▶│  PostgreSQL │
│   (React)   │     │   Client    │     │  Database   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │
       │                   ▼
       │            ┌─────────────┐
       │            │   Edge      │
       │            │  Functions  │
       │            └─────────────┘
       │
       ▼
┌─────────────┐
│   Shopify   │
│ Storefront  │
│    API      │
└─────────────┘
```

---

## Banco de Dados (Supabase)

### Tabelas

#### `profiles`
Armazena dados pessoais e de endereço dos usuários.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Chave primária |
| user_id | uuid | Referência ao auth.users |
| full_name | text | Nome completo |
| phone | text | Telefone |
| avatar_url | text | URL do avatar |
| address_street | text | Rua |
| address_number | text | Número |
| address_complement | text | Complemento |
| address_neighborhood | text | Bairro |
| address_city | text | Cidade |
| address_state | text | Estado |
| address_zip | text | CEP |
| created_at | timestamptz | Data de criação |
| updated_at | timestamptz | Data de atualização |

**Trigger**: `handle_new_user()` - Cria perfil automaticamente quando usuário se cadastra.

---

#### `user_roles`
Sistema de controle de acesso baseado em roles.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Chave primária |
| user_id | uuid | Referência ao auth.users |
| role | app_role | Enum: 'admin', 'user', 'subscriber' |
| created_at | timestamptz | Data de criação |

**Trigger**: `handle_new_user_role()` - Atribui role 'user' automaticamente no cadastro.

**Enum `app_role`**: `'admin' | 'user' | 'subscriber'`

---

#### `books`
Catálogo de livros armazenados localmente (complementar ao Shopify).

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Chave primária |
| handle | text | Identificador único (slug) |
| title | text | Título do livro |
| author | text | Autor |
| description | text | Descrição |
| price | numeric | Preço atual |
| original_price | numeric | Preço original (para desconto) |
| image_url | text | URL da capa |
| category | text | Categoria |
| in_stock | boolean | Disponibilidade |
| featured | boolean | Destaque na home |
| created_at | timestamptz | Data de criação |
| updated_at | timestamptz | Data de atualização |

---

#### `book_comments`
Comentários e avaliações de livros pelos usuários.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Chave primária |
| book_handle | text | Handle do livro |
| user_id | uuid | ID do usuário autor |
| user_name | text | Nome exibido |
| comment | text | Texto do comentário |
| rating | integer | Avaliação (1-5 estrelas) |
| status | text | 'pending', 'approved', 'rejected' |
| parent_id | uuid | Para respostas (threads) |
| created_at | timestamptz | Data de criação |
| updated_at | timestamptz | Data de atualização |

**Moderação**: Comentários iniciam com status 'pending' e precisam aprovação admin.

---

#### `comment_likes`
Curtidas em comentários (sistema de engajamento).

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Chave primária |
| comment_id | uuid | Referência ao comentário |
| user_id | uuid | Usuário que curtiu |
| created_at | timestamptz | Data da curtida |

**Constraint**: Unique (comment_id, user_id) - Uma curtida por usuário por comentário.

---

#### `favorites`
Lista de favoritos dos usuários.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Chave primária |
| user_id | uuid | ID do usuário |
| product_handle | text | Handle do produto |
| product_title | text | Título (cache) |
| product_image | text | Imagem (cache) |
| product_price | numeric | Preço (cache) |
| created_at | timestamptz | Data de adição |

---

#### `purchase_history`
Histórico de compras para cálculo de bestsellers.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Chave primária |
| user_id | uuid | ID do comprador |
| order_id | text | ID do pedido Shopify |
| product_handle | text | Handle do produto |
| product_title | text | Título |
| product_image | text | Imagem |
| product_price | numeric | Preço pago |
| quantity | integer | Quantidade |
| purchased_at | timestamptz | Data da compra |

---

#### `contacts`
Mensagens de contato/suporte dos usuários.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Chave primária |
| user_id | uuid | ID do usuário (opcional) |
| name | text | Nome do remetente |
| email | text | Email |
| subject | text | Assunto |
| message | text | Mensagem (max 1000 chars) |
| status | text | 'pending', 'resolved' |
| resolved_at | timestamptz | Data de resolução |
| created_at | timestamptz | Data de envio |

---

#### `promotions`
Promoções temáticas especiais.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Chave primária |
| title | text | Título da promoção |
| description | text | Descrição |
| discount_percentage | integer | Percentual de desconto |
| theme_color | text | Cor tema (hex) |
| is_active | boolean | Promoção ativa |
| start_date | timestamptz | Início |
| end_date | timestamptz | Fim |
| created_by | uuid | Admin criador |
| created_at | timestamptz | Data de criação |
| updated_at | timestamptz | Data de atualização |

---

#### `promotion_books`
Relacionamento N:N entre promoções e livros.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Chave primária |
| promotion_id | uuid | Referência à promoção |
| book_id | uuid | Referência ao livro |
| created_at | timestamptz | Data de adição |

---

#### `site_settings`
Configurações do CMS (textos e imagens editáveis).

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Chave primária |
| key | text | Chave única da configuração |
| value | jsonb | Valor (JSON flexível) |
| updated_by | uuid | Último editor |
| updated_at | timestamptz | Data de atualização |

**Keys utilizadas**:
- `site_texts`: Textos editáveis do site
- `site_images`: URLs das imagens (logo, hero, favicon)

---

### Funções do Banco de Dados

#### `has_role(user_id uuid, role app_role) → boolean`
Verifica se usuário possui determinada role.

```sql
-- Uso em RLS policies
USING (has_role(auth.uid(), 'admin'))
```

**SECURITY DEFINER**: Executa com privilégios do owner para evitar recursão em RLS.

---

#### `handle_new_user() → trigger`
Trigger executado após INSERT em `auth.users`.
Cria registro em `profiles` com dados iniciais do usuário.

---

#### `handle_new_user_role() → trigger`
Trigger executado após INSERT em `auth.users`.
Atribui role 'user' padrão ao novo usuário.

---

#### `update_updated_at_column() → trigger`
Trigger genérico para atualizar coluna `updated_at` automaticamente.

---

### Row Level Security (RLS)

Todas as tabelas possuem RLS habilitado. Padrões principais:

| Tabela | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| profiles | próprio + admin | próprio | próprio | próprio |
| user_roles | próprio + admin | admin | admin | admin |
| books | público | admin | admin | admin |
| book_comments | aprovados + próprio + admin | próprio | próprio + admin | próprio + admin |
| comment_likes | público | próprio | - | próprio |
| favorites | próprio | próprio | - | próprio |
| purchase_history | próprio + admin | próprio | admin | admin |
| contacts | próprio + admin | público | admin | admin |
| promotions | ativos + admin | admin | admin | admin |
| promotion_books | público | admin | admin | admin |
| site_settings | público | admin | admin | - |

---

## Edge Functions

### `delete-user-account`
**Localização**: `supabase/functions/delete-user-account/index.ts`

**Propósito**: Exclusão completa de conta de usuário (dados + auth).

**Autenticação**: Requer JWT válido.

**Fluxo**:
1. Valida token do usuário
2. Verifica se é auto-deleção ou admin deletando outro usuário
3. Remove dados das tabelas (cascata automática por FK)
4. Remove usuário do Supabase Auth via `auth.admin.deleteUser()`

**Request**:
```typescript
POST /delete-user-account
Authorization: Bearer <jwt>
Body: { userId: string }
```

**Response**:
```typescript
{ success: true, message: string }
// ou
{ error: string }
```

---

### `get-bestsellers`
**Localização**: `supabase/functions/get-bestsellers/index.ts`

**Propósito**: Calcula livros mais vendidos baseado no histórico de compras.

**Autenticação**: Pública (JWT não requerido).

**Fluxo**:
1. Usa `service_role` para acessar `purchase_history` (bypass RLS)
2. Agrupa por `product_handle` e soma quantidades
3. Ordena por total de vendas
4. Retorna top N produtos

**Request**:
```typescript
GET /get-bestsellers?limit=10
```

**Response**:
```typescript
{
  bestsellers: [
    { product_handle: string, total_sold: number }
  ]
}
```

---

## Hooks React

### `useAuth`
**Arquivo**: `src/hooks/useAuth.tsx`

**Propósito**: Gerenciamento de autenticação.

**Funcionalidades**:
- `user`: Usuário atual
- `session`: Sessão ativa
- `signUp()`: Cadastro com email/senha + metadados
- `signIn()`: Login
- `signOut()`: Logout
- `resetPassword()`: Recuperação de senha

**Uso**:
```typescript
const { user, signIn, signOut } = useAuth();
```

---

### `useUserRole`
**Arquivo**: `src/hooks/useUserRole.tsx`

**Propósito**: Verificação de roles do usuário.

**Retorno**:
- `role`: Role atual ('admin' | 'user' | 'subscriber')
- `isAdmin`: Boolean helper
- `isLoading`: Estado de carregamento

---

### `useSubscriberRole`
**Arquivo**: `src/hooks/useSubscriberRole.tsx`

**Propósito**: Verifica se usuário é subscriber ou admin.

**Retorno**:
- `isSubscriber`: Boolean
- `isLoading`: Estado de carregamento

---

### `useProfile`
**Arquivo**: `src/hooks/useProfile.tsx`

**Propósito**: CRUD do perfil do usuário.

**Funcionalidades**:
- `profile`: Dados do perfil
- `updateProfile()`: Atualiza dados
- `uploadAvatar()`: Upload de foto

---

### `useBooks`
**Arquivo**: `src/hooks/useBooks.tsx`

**Propósito**: Gerenciamento do catálogo de livros (Supabase).

**Funcionalidades**:
- `books`: Lista de livros
- `featuredBooks`: Livros em destaque
- `addBook()`: Adiciona livro (admin)
- `updateBook()`: Atualiza livro (admin)
- `deleteBook()`: Remove livro (admin)

---

### `useBookComments`
**Arquivo**: `src/hooks/useBookComments.tsx`

**Propósito**: Sistema de comentários e curtidas.

**Funcionalidades**:
- `comments`: Comentários do livro
- `addComment()`: Adiciona comentário (status pending)
- `deleteComment()`: Remove comentário
- `toggleLike()`: Curtir/descurtir
- `updateCommentStatus()`: Moderação (admin)
- `getAllComments()`: Todos comentários (admin)

---

### `useFavorites`
**Arquivo**: `src/hooks/useFavorites.tsx`

**Propósito**: Lista de favoritos do usuário.

**Funcionalidades**:
- `favorites`: Lista de favoritos
- `addFavorite()`: Adiciona aos favoritos
- `removeFavorite()`: Remove dos favoritos
- `isFavorite()`: Verifica se é favorito

---

### `usePurchaseHistory`
**Arquivo**: `src/hooks/usePurchaseHistory.tsx`

**Propósito**: Histórico de compras do usuário.

**Funcionalidades**:
- `purchases`: Lista de compras
- `addPurchase()`: Registra compra
- `getBestsellers()`: Busca mais vendidos

---

### `usePromotions`
**Arquivo**: `src/hooks/usePromotions.tsx`

**Propósito**: Gerenciamento de promoções temáticas.

**Funcionalidades**:
- `promotions`: Lista de promoções
- `activePromotion`: Promoção ativa atual
- `createPromotion()`: Cria promoção (admin)
- `updatePromotion()`: Atualiza promoção (admin)
- `deletePromotion()`: Remove promoção (admin)
- `addBooksToPromotion()`: Adiciona livros
- `removeBooksFromPromotion()`: Remove livros

---

### `useContacts`
**Arquivo**: `src/hooks/useContacts.tsx`

**Propósito**: Sistema de contato/suporte.

**Funcionalidades**:
- `contacts`: Lista de contatos (admin)
- `sendContact()`: Envia mensagem
- `resolveContact()`: Marca como resolvido (admin)
- `deleteContact()`: Remove contato (admin)

---

### `useSiteTexts`
**Arquivo**: `src/hooks/useSiteTexts.tsx`

**Propósito**: CMS de textos do site.

**Funcionalidades**:
- `texts`: Textos atuais
- `updateTexts()`: Atualiza textos (admin)

---

### `useSiteImages`
**Arquivo**: `src/hooks/useSiteImages.tsx`

**Propósito**: CMS de imagens do site.

**Funcionalidades**:
- `images`: URLs das imagens
- `uploadImage()`: Upload de imagem (admin)
- `updateImageUrl()`: Atualiza URL (admin)

---

### `useSiteSettings`
**Arquivo**: `src/hooks/useSiteSettings.tsx`

**Propósito**: Configurações gerais do site.

**Funcionalidades**:
- `settings`: Configurações
- `updateSetting()`: Atualiza configuração (admin)

---

### `useAdminUsers`
**Arquivo**: `src/hooks/useAdminUsers.tsx`

**Propósito**: Gerenciamento de usuários (admin).

**Funcionalidades**:
- `users`: Lista de usuários
- `updateUserRole()`: Altera role
- `deleteUser()`: Remove usuário

---

## Stores (Zustand)

### `cartStore`
**Arquivo**: `src/stores/cartStore.ts`

**Propósito**: Gerenciamento do carrinho de compras.

**Estado**:
```typescript
interface CartStore {
  items: CartItem[];
  cartId: string | null;
  checkoutUrl: string | null;
  isLoading: boolean;
}
```

**Ações**:
- `addItem(item)`: Adiciona item ao carrinho
- `updateQuantity(id, quantity)`: Atualiza quantidade
- `removeItem(id)`: Remove item
- `clearCart()`: Limpa carrinho
- `createCheckout()`: Cria checkout Shopify
- `getTotalItems()`: Total de itens
- `getTotalPrice()`: Preço total

**Persistência**: LocalStorage (`leiacomigo-cart`)

---

## Integrações

### Shopify Storefront API
**Arquivo**: `src/lib/shopify.ts`

**Configuração**:
- Domain: Via `SHOPIFY_SHOP_PERMANENT_DOMAIN`
- Token: Via `SHOPIFY_STOREFRONT_ACCESS_TOKEN`

**Funcionalidades**:
- Busca de produtos
- Criação de checkout
- Gerenciamento de carrinho

**Fluxo de Compra**:
1. Usuário adiciona itens (Zustand store)
2. `createCheckout()` cria checkout Shopify
3. Redirect para checkout Shopify
4. Webhook/callback registra em `purchase_history`

---

### Supabase Storage

**Buckets**:
- `avatars`: Fotos de perfil (público)
- `site-images`: Imagens do CMS (público)

**Políticas**:
- Upload: Apenas usuário autenticado
- Download: Público

---

### ViaCEP API
**Uso**: Auto-preenchimento de endereço no perfil.

**Endpoint**: `https://viacep.com.br/ws/{cep}/json/`

**Fluxo**:
1. Usuário digita CEP completo (8 dígitos)
2. Busca automática na API
3. Preenche campos de endereço

---

## Segurança

### Princípios Implementados

1. **RLS em todas as tabelas**: Acesso controlado no nível do banco
2. **Roles separadas de profiles**: Evita privilege escalation
3. **Security Definer Functions**: Bypass seguro de RLS para funções administrativas
4. **JWT validation**: Todas Edge Functions validam tokens
5. **Service Role isolado**: Usado apenas em Edge Functions server-side

### Fluxo de Autenticação

```
┌─────────┐    ┌──────────┐    ┌─────────┐
│ Cliente │───▶│ Supabase │───▶│  Auth   │
│         │    │  Client  │    │ Service │
└─────────┘    └──────────┘    └─────────┘
                    │
                    ▼
              ┌──────────┐
              │   JWT    │
              │  Token   │
              └──────────┘
                    │
                    ▼
              ┌──────────┐
              │   RLS    │
              │ Policies │
              └──────────┘
```

---

## Convenções de Código

### Nomenclatura
- **Hooks**: `use<NomeDoRecurso>` (ex: `useBooks`)
- **Componentes Admin**: `src/components/admin/<Nome>Manager.tsx`
- **Edge Functions**: kebab-case (ex: `delete-user-account`)
- **Tabelas**: snake_case (ex: `book_comments`)

### Padrões
- Queries: TanStack Query para cache e sincronização
- Forms: React Hook Form + Zod validation
- UI: Shadcn/ui + Tailwind CSS
- Estado global: Zustand (apenas carrinho)

---

*Última atualização: Dezembro 2024*
