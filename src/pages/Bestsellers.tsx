import { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PromotionBanner from "@/components/PromotionBanner";
import MonthlyPicks from "@/components/MonthlyPicks";
import InspirationalQuote, { getRandomQuote } from "@/components/InspirationalQuote";
import { useBestsellers } from "@/hooks/useBooks";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { useFavorites } from "@/hooks/useFavorites";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShoppingBag, Heart, TrendingUp, Trophy } from "lucide-react";
import { toast } from "sonner";

const Bestsellers = () => {
  const { bestsellers, loading: bestsellersLoading } = useBestsellers();
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);
  const { isFavorite, toggleFavorite } = useFavorites();
  const quote = useMemo(() => getRandomQuote(), []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts(50);
        setProducts(data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const handleAddToCart = (product: ShopifyProduct) => {
    const variant = product.node.variants.edges[0]?.node;
    if (!variant) return;

    addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });

    toast.success("Adicionado ao carrinho!", {
      description: product.node.title,
    });
  };

  const handleToggleFavorite = (product: ShopifyProduct) => {
    toggleFavorite({
      handle: product.node.handle,
      title: product.node.title,
      image: product.node.images.edges[0]?.node.url,
      price: parseFloat(product.node.priceRange.minVariantPrice.amount),
    });
  };

  // Get bestseller products sorted by sales
  const bestsellersProducts = bestsellers
    .map((bs) => {
      const product = products.find((p) => p.node.handle === bs.handle);
      return product ? { product, sales: bs.total_sold } : null;
    })
    .filter(Boolean) as { product: ShopifyProduct; sales: number }[];

  const isLoading = loading || bestsellersLoading;

  return (
    <>
      <Helmet>
        <title>Destaques - Mais Vendidos | Orbe Livros</title>
        <meta
          name="description"
          content="Confira os livros mais vendidos da Orbe Livros"
        />
      </Helmet>

      <Header />

      <main className="min-h-screen pt-24 pb-16">
        <div className="container">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <TrendingUp className="h-4 w-4" />
              Mais Vendidos
            </span>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Destaques da Livraria
            </h1>
            <p className="text-muted-foreground">
              Os livros preferidos dos nossos clientes. Descubra o que está
              fazendo sucesso!
            </p>
          </div>

          {/* Promotion Banner */}
          <PromotionBanner />

          {/* Monthly Picks */}
          <MonthlyPicks />

          {/* Inspirational Quote */}
          <InspirationalQuote quote={quote.quote} author={quote.author} className="my-8 bg-muted/30 rounded-xl" />

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : bestsellersProducts.length === 0 ? (
            <div className="text-center py-20">
              <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-serif text-2xl font-bold mb-2">
                Ainda não há destaques
              </h2>
              <p className="text-muted-foreground mb-6">
                Os livros mais vendidos aparecerão aqui quando houver compras.
              </p>
              <Button asChild>
                <Link to="/livros">Explorar Livros</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {bestsellersProducts.map(({ product, sales }, index) => {
                const price = parseFloat(
                  product.node.priceRange.minVariantPrice.amount
                );
                const image = product.node.images.edges[0]?.node;

                return (
                  <Card
                    key={product.node.id}
                    className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    <CardContent className="p-0">
                      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                        {/* Ranking Badge */}
                        <Badge
                          className="absolute top-3 left-3 z-10 bg-primary text-primary-foreground"
                          variant="default"
                        >
                          #{index + 1}
                        </Badge>

                        {/* Favorite Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleToggleFavorite(product);
                          }}
                          className="absolute top-3 right-3 z-10 w-9 h-9 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:bg-background"
                        >
                          <Heart
                            className={`h-5 w-5 ${
                              isFavorite(product.node.handle)
                                ? "fill-primary text-primary"
                                : "text-muted-foreground"
                            }`}
                          />
                        </button>

                        <Link to={`/produto/${product.node.handle}`}>
                          {image ? (
                            <img
                              src={image.url}
                              alt={image.altText || product.node.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="h-16 w-16 text-muted-foreground" />
                            </div>
                          )}
                        </Link>

                        {/* Quick Add */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-background/90 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <Button
                            variant="hero"
                            size="sm"
                            className="w-full"
                            onClick={() => handleAddToCart(product)}
                          >
                            <ShoppingBag className="h-4 w-4" />
                            Adicionar
                          </Button>
                        </div>
                      </div>

                      <div className="p-4">
                        <Link to={`/produto/${product.node.handle}`}>
                          <h3 className="font-medium text-foreground line-clamp-2 mb-2 hover:text-primary transition-colors">
                            {product.node.title}
                          </h3>
                        </Link>
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-primary">
                            R$ {price.toFixed(2).replace(".", ",")}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {sales} vendidos
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Bestsellers;