import { useActivePromotion } from "@/hooks/usePromotions";
import { useBooks } from "@/hooks/useBooks";
import { useCartStore } from "@/stores/cartStore";
import { useFavorites } from "@/hooks/useFavorites";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShoppingBag, Heart, Tag, Sparkles } from "lucide-react";
import { toast } from "sonner";

const PromotionBanner = () => {
  const { promotion, promotionBooks, loading } = useActivePromotion();
  const { books } = useBooks();
  const [shopifyProducts, setShopifyProducts] = useState<ShopifyProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts(100);
        setShopifyProducts(data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setProductsLoading(false);
      }
    };
    loadProducts();
  }, []);

  if (loading || !promotion) return null;

  // Get promotion books from local database
  const promoLocalBooks = books.filter((book) => promotionBooks.includes(book.id));

  // Get shopify products for promotion books
  const promoShopifyProducts = promoLocalBooks
    .map((book) => {
      const shopifyProduct = shopifyProducts.find((p) => p.node.handle === book.handle);
      return shopifyProduct ? { book, shopifyProduct } : { book, shopifyProduct: null };
    })
    .filter((item) => item.book);

  if (promoShopifyProducts.length === 0) return null;

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

  const handleToggleFavorite = (book: typeof promoLocalBooks[0]) => {
    toggleFavorite({
      handle: book.handle,
      title: book.title,
      image: book.image_url || undefined,
      price: book.price,
    });
  };

  const calculateDiscountedPrice = (originalPrice: number) => {
    return originalPrice * (1 - promotion.discount_percentage / 100);
  };

  return (
    <section
      className="mb-16 rounded-2xl p-6 md:p-8"
      style={{
        background: `linear-gradient(135deg, ${promotion.theme_color}15 0%, ${promotion.theme_color}05 100%)`,
        borderLeft: `4px solid ${promotion.theme_color}`,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div
          className="p-2 rounded-full"
          style={{ backgroundColor: `${promotion.theme_color}20` }}
        >
          <Sparkles className="h-5 w-5" style={{ color: promotion.theme_color }} />
        </div>
        <Badge
          className="text-white border-0"
          style={{ backgroundColor: promotion.theme_color }}
        >
          <Tag className="h-3 w-3 mr-1" />
          {promotion.discount_percentage}% OFF
        </Badge>
      </div>

      <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-2">
        {promotion.title}
      </h2>

      {promotion.description && (
        <p className="text-muted-foreground mb-6 max-w-2xl">
          {promotion.description}
        </p>
      )}

      {/* Products Grid */}
      {productsLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {promoShopifyProducts.slice(0, 8).map(({ book, shopifyProduct }) => {
            const discountedPrice = calculateDiscountedPrice(book.price);
            const image = shopifyProduct?.node.images.edges[0]?.node || null;

            return (
              <Card
                key={book.id}
                className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-0">
                  <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                    {/* Discount Badge */}
                    <Badge
                      className="absolute top-3 left-3 z-10 text-white border-0"
                      style={{ backgroundColor: promotion.theme_color }}
                    >
                      -{promotion.discount_percentage}%
                    </Badge>

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleToggleFavorite(book);
                      }}
                      className="absolute top-3 right-3 z-10 w-9 h-9 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:bg-background"
                    >
                      <Heart
                        className={`h-5 w-5 ${
                          isFavorite(book.handle)
                            ? "fill-primary text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>

                    <Link to={`/produto/${book.handle}`}>
                      {image || book.image_url ? (
                        <img
                          src={image?.url || book.image_url || ""}
                          alt={image?.altText || book.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="h-16 w-16 text-muted-foreground" />
                        </div>
                      )}
                    </Link>

                    {/* Quick Add */}
                    {shopifyProduct && (
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-background/90 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <Button
                          variant="hero"
                          size="sm"
                          className="w-full"
                          onClick={() => handleAddToCart(shopifyProduct)}
                        >
                          <ShoppingBag className="h-4 w-4" />
                          Adicionar
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <Link to={`/produto/${book.handle}`}>
                      <h3 className="font-medium text-foreground line-clamp-2 mb-2 hover:text-primary transition-colors text-sm">
                        {book.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2">
                      <p
                        className="font-bold"
                        style={{ color: promotion.theme_color }}
                      >
                        R$ {discountedPrice.toFixed(2).replace(".", ",")}
                      </p>
                      <p className="text-xs text-muted-foreground line-through">
                        R$ {book.price.toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default PromotionBanner;
