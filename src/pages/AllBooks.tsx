import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";
import { ProductCard } from "@/components/ProductCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Loader2, BookOpen, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AllBooks = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts(100);
        setProducts(data);
        setFilteredProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Erro ao carregar produtos");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    let result = [...products];

    // Filter by category
    if (filterCategory !== "all") {
      result = result.filter((product) => {
        const tags = product.node.description?.toLowerCase() || "";
        const title = product.node.title?.toLowerCase() || "";
        return tags.includes(filterCategory) || title.includes(filterCategory);
      });
    }

    // Sort
    switch (sortBy) {
      case "price-asc":
        result.sort(
          (a, b) =>
            parseFloat(a.node.priceRange.minVariantPrice.amount) -
            parseFloat(b.node.priceRange.minVariantPrice.amount)
        );
        break;
      case "price-desc":
        result.sort(
          (a, b) =>
            parseFloat(b.node.priceRange.minVariantPrice.amount) -
            parseFloat(a.node.priceRange.minVariantPrice.amount)
        );
        break;
      case "name":
        result.sort((a, b) => a.node.title.localeCompare(b.node.title));
        break;
      default:
        break;
    }

    setFilteredProducts(result);
  }, [products, sortBy, filterCategory]);

  const categories = [
    { value: "all", label: "Todas as Categorias" },
    { value: "romance", label: "Romance" },
    { value: "suspense", label: "Suspense" },
    { value: "clássico", label: "Clássicos" },
    { value: "thriller", label: "Thriller" },
    { value: "young adult", label: "Young Adult" },
  ];

  return (
    <>
      <Helmet>
        <title>Todos os Livros | Livraria Encanto</title>
        <meta
          name="description"
          content="Explore nossa coleção completa de livros. Romances, suspenses, clássicos e muito mais para você se apaixonar."
        />
      </Helmet>

      <Header />

      <main className="min-h-screen pt-24">
        {/* Hero Section */}
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

        {/* Filters */}
        <section className="py-8 border-b">
          <div className="container">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span className="text-sm">
                  {filteredProducts.length} livros encontrados
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
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
        </section>

        {/* Products Grid */}
        <section className="py-12 md:py-16">
          <div className="container">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-destructive">{error}</p>
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
                <Button variant="outline" onClick={() => setFilterCategory("all")}>
                  Limpar Filtros
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                {filteredProducts.map((product, index) => (
                  <ProductCard key={product.node.id} product={product} index={index} />
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
