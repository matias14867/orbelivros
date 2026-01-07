import { useState, useMemo, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams, Link } from "react-router-dom";
import { useProducts, useProductCategories } from "@/hooks/useProducts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, BookOpen, Filter, Search, X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductCard } from "@/components/ProductCard";
import { PriceFilter } from "@/components/PriceFilter";

const AllBooks = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useProductCategories();
  const [sortBy, setSortBy] = useState<string>("newest");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [showOnlyInStock, setShowOnlyInStock] = useState(false);
  
  const urlCategory = searchParams.get("categoria") || "all";
  const urlSearch = searchParams.get("busca") || "";
  const [filterCategory, setFilterCategory] = useState<string>(urlCategory);
  const [searchQuery, setSearchQuery] = useState<string>(urlSearch);

  const { minProductPrice, maxProductPrice } = useMemo(() => {
    if (!products || products.length === 0) return { minProductPrice: 0, maxProductPrice: 1000 };
    const prices = products.map((p) => p.price);
    return {
      minProductPrice: Math.floor(Math.min(...prices)),
      maxProductPrice: Math.ceil(Math.max(...prices)),
    };
  }, [products]);

  useEffect(() => {
    if (products && products.length > 0 && priceRange[0] === 0 && priceRange[1] === 1000) {
      setPriceRange([minProductPrice, maxProductPrice]);
    }
  }, [products, minProductPrice, maxProductPrice]);

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
    setShowOnlyInStock(false);
    setSearchQuery("");
    setPriceRange([minProductPrice, maxProductPrice]);
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = 
    filterCategory !== "all" || 
    showOnlyInStock || 
    searchQuery.trim() !== "" ||
    priceRange[0] !== minProductPrice || 
    priceRange[1] !== maxProductPrice;

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    let result = [...products];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((product) => {
        const title = product.title.toLowerCase();
        const description = product.description?.toLowerCase() || "";
        return title.includes(query) || description.includes(query);
      });
    }

    result = result.filter((product) => {
      return product.price >= priceRange[0] && product.price <= priceRange[1];
    });

    if (filterCategory !== "all") {
      result = result.filter((product) => product.category === filterCategory);
    }

    if (showOnlyInStock) {
      result = result.filter((product) => product.in_stock);
    }

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
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    return result;
  }, [products, sortBy, filterCategory, showOnlyInStock, searchQuery, priceRange]);

  return (
    <>
      <Helmet>
        <title>Todos os Produtos | Dropshipping Store</title>
        <meta name="description" content="Explore nossa coleção completa de produtos." />
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
                Descubra produtos incríveis com os melhores preços
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
                  placeholder="Buscar produtos..."
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
                  <span>{filteredProducts.length} produtos</span>
                </div>

                <div className="flex flex-wrap gap-3 items-center">
                  <Select value={filterCategory} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {categories?.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Ordenar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Mais recentes</SelectItem>
                      <SelectItem value="price-asc">Menor preço</SelectItem>
                      <SelectItem value="price-desc">Maior preço</SelectItem>
                      <SelectItem value="name">Nome A-Z</SelectItem>
                    </SelectContent>
                  </Select>

                  <PriceFilter
                    minPrice={minProductPrice}
                    maxPrice={maxProductPrice}
                    currentMin={priceRange[0]}
                    currentMax={priceRange[1]}
                    onPriceChange={(min, max) => setPriceRange([min, max])}
                  />

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="in-stock"
                      checked={showOnlyInStock}
                      onCheckedChange={(checked) => setShowOnlyInStock(!!checked)}
                    />
                    <label htmlFor="in-stock" className="text-sm cursor-pointer">
                      Em estoque
                    </label>
                  </div>

                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-1" />
                      Limpar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="font-serif text-2xl font-bold mb-2">Nenhum produto encontrado</h2>
                <p className="text-muted-foreground mb-6">
                  Tente ajustar os filtros ou buscar por outro termo.
                </p>
                <Button onClick={clearFilters}>Limpar filtros</Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
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