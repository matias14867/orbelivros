import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchProductByHandle } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { useFavorites } from "@/hooks/useFavorites";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Minus, Plus, ShoppingBag, Heart, Truck, Shield } from "lucide-react";
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
  const [product, setProduct] = useState<ProductNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const addItem = useCartStore(state => state.addItem);
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    const loadProduct = async () => {
      if (!handle) return;
      try {
        setLoading(true);
        const data = await fetchProductByHandle(handle);
        setProduct(data);
        if (data?.variants.edges[0]) {
          setSelectedVariant(data.variants.edges[0].node.id);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [handle]);

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;

    const variant = product.variants.edges.find(v => v.node.id === selectedVariant)?.node;
    if (!variant) return;

    const cartItem = {
      product: { node: product },
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity,
      selectedOptions: variant.selectedOptions || []
    };
    
    addItem(cartItem);
    toast.success("Adicionado ao carrinho!", {
      description: `${quantity}x ${product.title}`,
      position: "top-center"
    });
  };

  const handleToggleFavorite = () => {
    if (!product) return;
    toggleFavorite({
      handle: product.handle,
      title: product.title,
      image: product.images.edges[0]?.node.url,
      price: parseFloat(product.priceRange.minVariantPrice.amount),
    });
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

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-40 text-center">
          <h1 className="font-serif text-3xl font-bold mb-4">Produto não encontrado</h1>
          <Link to="/">
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

  const price = parseFloat(product.priceRange.minVariantPrice.amount);
  const images = product.images.edges;
  const currentVariant = product.variants.edges.find(v => v.node.id === selectedVariant)?.node;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20">
        <div className="container">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8">
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
                    alt={images[selectedImage].node.altText || product.title}
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
                  {product.title}
                </h1>
                <p className="text-3xl font-bold text-primary">
                  R$ {price.toFixed(2).replace(".", ",")}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  ou 12x de R$ {(price / 12).toFixed(2).replace(".", ",")} sem juros
                </p>
              </div>

              {product.description && (
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Variants */}
              {product.variants.edges.length > 1 && (
                <div>
                  <label className="block text-sm font-medium mb-3">Variante</label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.edges.map((variant) => (
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
                  variant="hero" 
                  size="xl" 
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={!currentVariant?.availableForSale}
                >
                  <ShoppingBag className="h-5 w-5" />
                  Adicionar ao Carrinho
                </Button>
                <Button 
                  variant="outline" 
                  size="xl"
                  onClick={handleToggleFavorite}
                  className={isFavorite(product.handle) ? "text-primary border-primary" : ""}
                >
                  <Heart className={`h-5 w-5 ${isFavorite(product.handle) ? "fill-primary" : ""}`} />
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
