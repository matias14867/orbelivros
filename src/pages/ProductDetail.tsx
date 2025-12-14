import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { fetchProductByHandle } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { useFavorites } from "@/hooks/useFavorites";
import { useBooks, Book } from "@/hooks/useBooks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Minus, Plus, ShoppingBag, Heart, Truck, Shield, BookOpen } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface ProductNode {
  id: string;
  title: string;
  description: string;
  handle: string;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  images: {
    edges: Array<{
      node: {
        url: string;
        altText: string | null;
      };
    }>;
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        price: {
          amount: string;
          currencyCode: string;
        };
        availableForSale: boolean;
        selectedOptions: Array<{
          name: string;
          value: string;
        }>;
      };
    }>;
  };
  options: Array<{
    name: string;
    values: string[];
  }>;
}

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const [shopifyProduct, setShopifyProduct] = useState<ProductNode | null>(null);
  const [dbBook, setDbBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const addItem = useCartStore(state => state.addItem);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { books } = useBooks();

  useEffect(() => {
    const loadProduct = async () => {
      if (!handle) return;
      setLoading(true);
      
      try {
        // Try Shopify first
        const shopifyData = await fetchProductByHandle(handle);
        if (shopifyData) {
          setShopifyProduct(shopifyData);
          setDbBook(null);
          if (shopifyData.variants.edges[0]) {
            setSelectedVariant(shopifyData.variants.edges[0].node.id);
          }
        } else {
          // Fall back to database
          const book = books.find(b => b.handle === handle);
          if (book) {
            setDbBook(book);
            setShopifyProduct(null);
          }
        }
      } catch (err) {
        console.error("Error fetching from Shopify:", err);
        // Try database as fallback
        const book = books.find(b => b.handle === handle);
        if (book) {
          setDbBook(book);
          setShopifyProduct(null);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [handle, books]);

  const handleAddToCart = () => {
    if (shopifyProduct && selectedVariant) {
      const variant = shopifyProduct.variants.edges.find(v => v.node.id === selectedVariant)?.node;
      if (!variant) return;

      const cartItem = {
        product: { node: shopifyProduct },
        variantId: variant.id,
        variantTitle: variant.title,
        price: variant.price,
        quantity,
        selectedOptions: variant.selectedOptions || []
      };
      
      addItem(cartItem);
      toast.success("Adicionado ao carrinho!", {
        description: `${quantity}x ${shopifyProduct.title}`,
        position: "top-center"
      });
    } else if (dbBook) {
      const cartItem = {
        product: {
          node: {
            id: `db-${dbBook.id}`,
            title: dbBook.title,
            description: dbBook.description || "",
            handle: dbBook.handle,
            priceRange: {
              minVariantPrice: {
                amount: String(dbBook.price),
                currencyCode: "BRL",
              },
            },
            images: {
              edges: dbBook.image_url ? [{ node: { url: dbBook.image_url, altText: dbBook.title } }] : [],
            },
            variants: {
              edges: [{
                node: {
                  id: `gid://shopify/ProductVariant/db-${dbBook.id}`,
                  title: "Default",
                  price: { amount: String(dbBook.price), currencyCode: "BRL" },
                  availableForSale: dbBook.in_stock ?? true,
                  selectedOptions: [],
                }
              }],
            },
            options: [],
          },
        },
        variantId: `gid://shopify/ProductVariant/db-${dbBook.id}`,
        variantTitle: "Default",
        price: { amount: String(dbBook.price), currencyCode: "BRL" },
        quantity,
        selectedOptions: [],
      };
      
      addItem(cartItem);
      toast.success("Adicionado ao carrinho!", {
        description: `${quantity}x ${dbBook.title}`,
        position: "top-center"
      });
    }
  };

  const handleToggleFavorite = () => {
    if (shopifyProduct) {
      toggleFavorite({
        handle: shopifyProduct.handle,
        title: shopifyProduct.title,
        image: shopifyProduct.images.edges[0]?.node.url,
        price: parseFloat(shopifyProduct.priceRange.minVariantPrice.amount),
      });
    } else if (dbBook) {
      toggleFavorite({
        handle: dbBook.handle,
        title: dbBook.title,
        image: dbBook.image_url || undefined,
        price: dbBook.price,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  // Render for database book
  if (dbBook) {
    const currentHandle = dbBook.handle;
    const isFav = isFavorite(currentHandle);

    return (
      <div className="min-h-screen bg-background">
        <Helmet>
          <title>{dbBook.title} | Orbe Livros</title>
          <meta name="description" content={dbBook.description || `Compre ${dbBook.title} na Orbe Livros`} />
        </Helmet>

        <Header />
        <main className="pt-24 pb-20">
          <div className="container">
            <Link to="/livros" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8">
              <ArrowLeft className="h-4 w-4" />
              Voltar para a loja
            </Link>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Image */}
              <div className="space-y-4">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-card">
                  {dbBook.image_url ? (
                    <img
                      src={dbBook.image_url}
                      alt={dbBook.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                      <div className="text-center p-8">
                        <BookOpen className="h-20 w-20 text-primary/50 mx-auto mb-4" />
                        <p className="text-lg text-muted-foreground font-medium">{dbBook.title}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="space-y-6">
                <div>
                  {dbBook.category && (
                    <Badge variant="secondary" className="mb-3">{dbBook.category}</Badge>
                  )}
                  <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
                    {dbBook.title}
                  </h1>
                  {dbBook.author && (
                    <p className="text-lg text-muted-foreground mb-4">por {dbBook.author}</p>
                  )}
                  <div className="flex items-center gap-3">
                    <p className="text-3xl font-bold text-primary">
                      R$ {dbBook.price.toFixed(2).replace(".", ",")}
                    </p>
                    {dbBook.original_price && dbBook.original_price > dbBook.price && (
                      <p className="text-xl text-muted-foreground line-through">
                        R$ {dbBook.original_price.toFixed(2).replace(".", ",")}
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    ou 12x de R$ {(dbBook.price / 12).toFixed(2).replace(".", ",")} sem juros
                  </p>
                </div>

                {dbBook.description && (
                  <p className="text-muted-foreground leading-relaxed">
                    {dbBook.description}
                  </p>
                )}

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium mb-3">Quantidade</label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <Button 
                    variant="default" 
                    size="lg" 
                    className="flex-1"
                    onClick={handleAddToCart}
                    disabled={!dbBook.in_stock}
                  >
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Adicionar ao Carrinho
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={handleToggleFavorite}
                    className={isFav ? "text-primary border-primary" : ""}
                  >
                    <Heart className={`h-5 w-5 ${isFav ? "fill-primary" : ""}`} />
                  </Button>
                </div>

                {/* Benefits */}
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Truck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Frete Grátis</p>
                      <p className="text-xs text-muted-foreground">Acima de R$ 99</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Compra Segura</p>
                      <p className="text-xs text-muted-foreground">Dados protegidos</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Original Shopify product render
  if (!shopifyProduct) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-40 text-center">
          <h1 className="font-serif text-3xl font-bold mb-4">Produto não encontrado</h1>
          <Link to="/livros">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para a loja
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const price = parseFloat(shopifyProduct.priceRange.minVariantPrice.amount);
  const images = shopifyProduct.images.edges;
  const currentVariant = shopifyProduct.variants.edges.find(v => v.node.id === selectedVariant)?.node;
  const productHandle = shopifyProduct.handle;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{shopifyProduct.title} | Orbe Livros</title>
        <meta name="description" content={shopifyProduct.description || `Compre ${shopifyProduct.title} na Orbe Livros`} />
      </Helmet>

      <Header />
      <main className="pt-24 pb-20">
        <div className="container">
          <Link to="/livros" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" />
            Voltar para a loja
          </Link>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Images */}
            <div className="space-y-4">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-card">
                {images[selectedImage] ? (
                  <img
                    src={images[selectedImage].node.url}
                    alt={images[selectedImage].node.altText || shopifyProduct.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <ShoppingBag className="h-20 w-20" />
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`flex-shrink-0 w-20 h-24 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage === idx ? "border-primary" : "border-transparent"
                      }`}
                    >
                      <img
                        src={img.node.url}
                        alt={img.node.altText || `Imagem ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div>
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {shopifyProduct.title}
                </h1>
                <p className="text-3xl font-bold text-primary">
                  R$ {price.toFixed(2).replace(".", ",")}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  ou 12x de R$ {(price / 12).toFixed(2).replace(".", ",")} sem juros
                </p>
              </div>

              {shopifyProduct.description && (
                <p className="text-muted-foreground leading-relaxed">
                  {shopifyProduct.description}
                </p>
              )}

              {/* Variants */}
              {shopifyProduct.variants.edges.length > 1 && (
                <div>
                  <label className="block text-sm font-medium mb-3">Variante</label>
                  <div className="flex flex-wrap gap-2">
                    {shopifyProduct.variants.edges.map((variant) => (
                      <button
                        key={variant.node.id}
                        onClick={() => setSelectedVariant(variant.node.id)}
                        disabled={!variant.node.availableForSale}
                        className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                          selectedVariant === variant.node.id
                            ? "border-primary bg-primary text-primary-foreground"
                            : variant.node.availableForSale
                            ? "border-border hover:border-primary"
                            : "border-border text-muted-foreground opacity-50 cursor-not-allowed"
                        }`}
                      >
                        {variant.node.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium mb-3">Quantidade</label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <Button 
                  variant="default" 
                  size="lg" 
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={!currentVariant?.availableForSale}
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Adicionar ao Carrinho
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={handleToggleFavorite}
                  className={isFavorite(productHandle) ? "text-primary border-primary" : ""}
                >
                  <Heart className={`h-5 w-5 ${isFavorite(productHandle) ? "fill-primary" : ""}`} />
                </Button>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Truck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Frete Grátis</p>
                    <p className="text-xs text-muted-foreground">Acima de R$ 99</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Compra Segura</p>
                    <p className="text-xs text-muted-foreground">Dados protegidos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;