import { useState, useMemo, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams, Link } from "react-router-dom";
import { useBooks, Book } from "@/hooks/useBooks";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Loader2, BookOpen, Filter, Search, X, ShoppingCart, Heart, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ProductCard } from "@/components/ProductCard";
import { useCartStore } from "@/stores/cartStore";
import { useFavorites } from "@/hooks/useFavorites";
import { toast } from "sonner";
import { PriceFilter } from "@/components/PriceFilter";

const CATEGORIES = [
  { value: "all", label: "Todas as Categorias" },
  { value: "Romance", label: "Romance" },
  { value: "Autoajuda", label: "Autoajuda" },
  { value: "Ficção", label: "Ficção" },
  { value: "Poesia", label: "Poesia" },
  { value: "Clássicos", label: "Clássicos" },
  { value: "Drama", label: "Drama" },
  { value: "Fantasia", label: "Fantasia" },
  { value: "Distopia", label: "Distopia" },
  { value: "Literatura Brasileira", label: "Literatura Brasileira" },
  { value: "Infantojuvenil", label: "Infantojuvenil" },
  { value: "Tragédia", label: "Tragédia" },
  { value: "Suspense", label: "Suspense" },
];

// Component for database books
const DatabaseBookCard = ({ book }: { book: Book }) => {
  const addItem = useCartStore((state) => state.addItem);
  const { toggleFavorite, isFavorite } = useFavorites();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const cartItem = {
      product: {
        node: {
          id: `db-${book.id}`,
          title: book.title,
          description: book.description || "",
          handle: book.handle,
          priceRange: {
            minVariantPrice: {
              amount: String(book.price),
              currencyCode: "BRL",
            },
          },
          images: {
            edges: book.image_url ? [{ node: { url: book.image_url, altText: book.title } }] : [],
          },
          variants: {
            edges: [{
              node: {
                id: `gid://shopify/ProductVariant/db-${book.id}`,
                title: "Default",
                price: { amount: String(book.price), currencyCode: "BRL" },
                availableForSale: book.in_stock ?? true,
                selectedOptions: [],
              }
            }],
          },
          options: [],
        },
      },
      variantId: `gid://shopify/ProductVariant/db-${book.id}`,
      variantTitle: "Default",
      price: { amount: String(book.price), currencyCode: "BRL" },
      quantity: 1,
      selectedOptions: [],
    };
    
    addItem(cartItem);
    toast.success("Adicionado ao carrinho!");
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleFavorite({
      handle: book.handle,
      title: book.title,
      image: book.image_url || undefined,
      price: book.price,
    });
  };

  const isBookFavorite = isFavorite(book.handle);

  return (
    <Link
      to={`/produto/${book.handle}`}
      className="group bg-card rounded-2xl shadow-card overflow-hidden hover-lift animate-fade-up"
    >
      <div className="aspect-[3/4] relative overflow-hidden bg-muted">
        {book.image_url ? (
          <img
            src={book.image_url}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <div className="text-center p-4">
              <BookOpen className="h-12 w-12 text-primary/50 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground font-medium line-clamp-2">{book.title}</p>
            </div>
          </div>
        )}
        
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {book.featured && (
            <Badge className="bg-primary text-primary-foreground">Destaque</Badge>
          )}
          {book.original_price && book.original_price > book.price && (
            <Badge variant="destructive">
              -{Math.round(((book.original_price - book.price) / book.original_price) * 100)}%
            </Badge>
          )}
        </div>

        <button
          onClick={handleToggleFavorite}
          className="absolute top-3 right-3 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
        >
          <Heart
            className={`h-4 w-4 ${isBookFavorite ? "fill-primary text-primary" : "text-muted-foreground"}`}
          />
        </button>

        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <Button onClick={handleAddToCart} className="w-full" size="sm">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>
      </div>

      <div className="p-4">
        {book.category && (
          <span className="text-xs text-primary font-medium uppercase tracking-wide">
            {book.category}
          </span>
        )}
        <h3 className="font-serif font-semibold text-foreground mt-1 line-clamp-2 group-hover:text-primary transition-colors">
          {book.title}
        </h3>
        {book.author && (
          <p className="text-sm text-muted-foreground mt-1">{book.author}</p>
        )}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-lg font-bold text-primary">
            R$ {book.price.toFixed(2).replace(".", ",")}
          </span>
          {book.original_price && book.original_price > book.price && (
            <span className="text-sm text-muted-foreground line-through">
              R$ {book.original_price.toFixed(2).replace(".", ",")}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

// Unified product interface
interface UnifiedProduct {
  id: string;
  title: string;
  author: string | null;
  description: string | null;
  price: number;
  originalPrice: number | null;
  category: string | null;
  imageUrl: string | null;
  handle: string;
  inStock: boolean;
  featured: boolean;
  source: "database" | "shopify";
  originalData: Book | ShopifyProduct;
}

const AllBooks = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { books: dbBooks, loading: dbLoading } = useBooks();
  const [shopifyProducts, setShopifyProducts] = useState<ShopifyProduct[]>([]);
  const [shopifyLoading, setShopifyLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  
  const urlCategory = searchParams.get("categoria") || "all";
  const urlSearch = searchParams.get("busca") || "";
  const [filterCategory, setFilterCategory] = useState<string>(urlCategory);
  const [searchQuery, setSearchQuery] = useState<string>(urlSearch);

  // Load Shopify products
  useEffect(() => {
    const loadShopifyProducts = async () => {
      try {
        setShopifyLoading(true);
        const data = await fetchProducts(100);
        setShopifyProducts(data);
      } catch (err) {
        console.error("Error fetching Shopify products:", err);
      } finally {
        setShopifyLoading(false);
      }
    };
    loadShopifyProducts();
  }, []);

  // Combine and deduplicate products
  const unifiedProducts = useMemo(() => {
    const products: UnifiedProduct[] = [];
    const seenHandles = new Set<string>();

    // Add Shopify products first (they have checkout capability)
    shopifyProducts.forEach((sp) => {
      const handle = sp.node.handle;
      if (!seenHandles.has(handle)) {
        seenHandles.add(handle);
        products.push({
          id: sp.node.id,
          title: sp.node.title,
          author: null, // Shopify uses vendor for author
          description: sp.node.description,
          price: parseFloat(sp.node.priceRange.minVariantPrice.amount),
          originalPrice: null,
          category: null, // Would need to parse from tags/type
          imageUrl: sp.node.images.edges[0]?.node.url || null,
          handle,
          inStock: sp.node.variants.edges.some(v => v.node.availableForSale),
          featured: false,
          source: "shopify",
          originalData: sp,
        });
      }
    });

    // Add database books (may have more metadata)
    dbBooks.forEach((book) => {
      if (!seenHandles.has(book.handle)) {
        seenHandles.add(book.handle);
        products.push({
          id: book.id,
          title: book.title,
          author: book.author,
          description: book.description,
          price: book.price,
          originalPrice: book.original_price,
          category: book.category,
          imageUrl: book.image_url,
          handle: book.handle,
          inStock: book.in_stock ?? true,
          featured: book.featured ?? false,
          source: "database",
          originalData: book,
        });
      }
    });

    return products;
  }, [dbBooks, shopifyProducts]);

  // Calculate min and max prices from products
  const { minProductPrice, maxProductPrice } = useMemo(() => {
    if (unifiedProducts.length === 0) return { minProductPrice: 0, maxProductPrice: 500 };
    const prices = unifiedProducts.map((p) => p.price);
    return {
      minProductPrice: Math.floor(Math.min(...prices)),
      maxProductPrice: Math.ceil(Math.max(...prices)),
    };
  }, [unifiedProducts]);

  // Initialize price range when products load
  useEffect(() => {
    if (unifiedProducts.length > 0 && priceRange[0] === 0 && priceRange[1] === 500) {
      setPriceRange([minProductPrice, maxProductPrice]);
    }
  }, [unifiedProducts, minProductPrice, maxProductPrice]);

  const handlePriceChange = (min: number, max: number) => {
    setPriceRange([min, max]);
  };

  const handleCategoryChange = (value: string) => {
    setFilterCategory(value);
    const newParams = new URLSearchParams(searchParams);
    if (value === "all") {
      newParams.delete("categoria");
    } else {
      newParams.set("categoria", value);
    }
    setSearchParams(newParams);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    const newParams = new URLSearchParams(searchParams);
    if (value.trim()) {
      newParams.set("busca", value);
    } else {
      newParams.delete("busca");
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setFilterCategory("all");
    setSearchQuery("");
    setPriceRange([minProductPrice, maxProductPrice]);
    setSearchParams(new URLSearchParams());
  };

  const filteredProducts = useMemo(() => {
    let result = [...unifiedProducts];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((product) => {
        const title = product.title.toLowerCase();
        const author = product.author?.toLowerCase() || "";
        const description = product.description?.toLowerCase() || "";
        return title.includes(query) || author.includes(query) || description.includes(query);
      });
    }

    // Filter by price range
    result = result.filter((product) => {
      return product.price >= priceRange[0] && product.price <= priceRange[1];
    });

    // Filter by category
    if (filterCategory !== "all") {
      result = result.filter((product) => {
        const category = product.category?.toLowerCase() || "";
        const filterLower = filterCategory.toLowerCase();
        return category.includes(filterLower) || product.title.toLowerCase().includes(filterLower);
      });
    }

    // Filter only in-stock
    result = result.filter((product) => product.inStock);

    // Sort
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "newest":
      default:
        // Featured first, then by title
        result.sort((a, b) => {
          if (a.featured !== b.featured) return b.featured ? 1 : -1;
          return a.title.localeCompare(b.title);
        });
        break;
    }

    return result;
  }, [unifiedProducts, sortBy, filterCategory, searchQuery, priceRange]);

  const loading = dbLoading || shopifyLoading;

  return (
    <>
      <Helmet>
        <title>Todos os Livros | Orbe Livros</title>
        <meta
          name="description"
          content="Explore nossa coleção completa de livros. Romances, clássicos, fantasia, autoajuda e muito mais para você se apaixonar."
        />
      </Helmet>

      <Header />

      <main className="min-h-screen pt-24">
        <section className="bg-gradient-to-b from-primary/10 to-background py-16">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto">
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
                Nossa Coleção Completa
              </h1>
              <p className="text-muted-foreground text-lg">
                Descubra histórias que vão transformar suas tardes e noites em momentos inesquecíveis
              </p>
            </div>
          </div>
        </section>

        <section className="py-8 border-b">
          <div className="container">
            <div className="flex flex-col gap-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar por título ou autor..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => handleSearchChange("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Filter className="h-4 w-4" />
                  <span className="text-sm">
                    {filteredProducts.length} livros encontrados
                    {searchQuery && ` para "${searchQuery}"`}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[200px] justify-start">
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        {priceRange[0] !== minProductPrice || priceRange[1] !== maxProductPrice
                          ? `R$ ${priceRange[0]} - R$ ${priceRange[1]}`
                          : "Filtrar Preço"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-0" align="end">
                      <PriceFilter
                        minPrice={minProductPrice}
                        maxPrice={maxProductPrice}
                        currentMin={priceRange[0]}
                        currentMax={priceRange[1]}
                        onPriceChange={handlePriceChange}
                      />
                    </PopoverContent>
                  </Popover>

                  <Select value={filterCategory} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Mais Recentes</SelectItem>
                      <SelectItem value="name">Nome (A-Z)</SelectItem>
                      <SelectItem value="price-asc">Preço: Menor</SelectItem>
                      <SelectItem value="price-desc">Preço: Maior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-2xl">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-serif text-2xl font-semibold text-foreground mb-2">
                  Nenhum livro encontrado
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  Tente ajustar os filtros para ver mais resultados.
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Limpar Filtros
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                {filteredProducts.map((product, index) => (
                  product.source === "shopify" ? (
                    <ProductCard 
                      key={product.id} 
                      product={product.originalData as ShopifyProduct} 
                      index={index} 
                    />
                  ) : (
                    <DatabaseBookCard 
                      key={product.id} 
                      book={product.originalData as Book} 
                    />
                  )
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default AllBooks;