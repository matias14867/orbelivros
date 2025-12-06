import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchBar = ({ isOpen, onClose }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ShopifyProduct[]>([]);
  const [allProducts, setAllProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const products = await fetchProducts(100);
        setAllProducts(products);
      } catch (error) {
        console.error("Error loading products for search:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && allProducts.length === 0) {
      loadProducts();
    }

    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, allProducts.length]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const searchQuery = query.toLowerCase().trim();
    const filtered = allProducts.filter((product) => {
      const title = product.node.title.toLowerCase();
      const description = product.node.description?.toLowerCase() || "";
      return title.includes(searchQuery) || description.includes(searchQuery);
    });

    setResults(filtered.slice(0, 6));
  }, [query, allProducts]);

  const handleSelect = (handle: string) => {
    navigate(`/produto/${handle}`);
    setQuery("");
    onClose();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/livros?busca=${encodeURIComponent(query.trim())}`);
      setQuery("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-foreground/50 backdrop-blur-sm animate-fade-in">
      <div className="container pt-24">
        <div className="bg-card rounded-2xl shadow-2xl max-w-2xl mx-auto overflow-hidden">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Buscar livros por título ou autor..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-6 text-lg border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </form>

          {loading && (
            <div className="p-6 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}

          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="p-6 text-center text-muted-foreground">
              Nenhum resultado encontrado para "{query}"
            </div>
          )}

          {results.length > 0 && (
            <div className="border-t">
              {results.map((product) => (
                <button
                  key={product.node.id}
                  onClick={() => handleSelect(product.node.handle)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left"
                >
                  {product.node.images.edges[0]?.node.url && (
                    <img
                      src={product.node.images.edges[0].node.url}
                      alt={product.node.title}
                      className="w-12 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate">
                      {product.node.title}
                    </h4>
                    <p className="text-sm text-primary font-semibold">
                      R$ {parseFloat(product.node.priceRange.minVariantPrice.amount).toFixed(2).replace(".", ",")}
                    </p>
                  </div>
                </button>
              ))}
              
              {query.trim() && (
                <button
                  onClick={handleSearch}
                  className="w-full p-4 text-center text-primary hover:bg-muted/50 transition-colors font-medium border-t"
                >
                  Ver todos os resultados para "{query}"
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
