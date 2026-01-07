import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useProduct } from "@/hooks/useProducts";
import { useCartStore } from "@/stores/cartStore";
import { useFavorites } from "@/hooks/useFavorites";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Minus, Plus, ShoppingBag, Heart, Truck, Shield, Package } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const { data: product, isLoading } = useProduct(handle || "");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const addItem = useCartStore(state => state.addItem);
  const { favorites, addFavorite, removeFavorite } = useFavorites();

  const isFavorite = favorites.some(f => f.product_handle === handle);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
    toast.success("Adicionado ao carrinho!", {
      description: `${quantity}x ${product.title}`,
      position: "top-center"
    });
  };

  const handleToggleFavorite = async () => {
    if (!product) return;
    
    if (isFavorite) {
      const fav = favorites.find(f => f.product_handle === product.handle);
      if (fav) {
        await removeFavorite(fav.id);
        toast.success("Removido dos favoritos");
      }
    } else {
      await addFavorite({
        handle: product.handle,
        title: product.title,
        image: product.image_url || undefined,
        price: product.price,
      });
      toast.success("Adicionado aos favoritos!");
    }
  };

  if (isLoading) {
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
          <Link to="/produtos">
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

  const images = product.images as string[] || [];
  const allImages = product.image_url ? [product.image_url, ...images] : images;

  const discountPercentage = product.compare_at_price 
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{product.title} | Dropshipping Store</title>
        <meta name="description" content={product.description || `Compre ${product.title}`} />
      </Helmet>

      <Header />
      <main className="pt-24 pb-20">
        <div className="container">
          <Link to="/produtos" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" />
            Voltar para a loja
          </Link>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Images */}
            <div className="space-y-4">
              <div className="aspect-square rounded-2xl overflow-hidden bg-card">
                {allImages[selectedImage] ? (
                  <img
                    src={allImages[selectedImage]}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Package className="h-20 w-20" />
                  </div>
                )}
              </div>
              {allImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage === idx ? "border-primary" : "border-transparent"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Imagem ${idx + 1}`}
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
                {product.category && (
                  <Badge variant="secondary" className="mb-3">{product.category}</Badge>
                )}
                {discountPercentage > 0 && (
                  <Badge variant="destructive" className="mb-3 ml-2">-{discountPercentage}%</Badge>
                )}
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {product.title}
                </h1>
                <p className="text-sm text-muted-foreground mb-4">
                  Fornecido por {product.supplier_name}
                </p>
                <div className="flex items-center gap-3">
                  <p className="text-3xl font-bold text-primary">
                    R$ {product.price.toFixed(2).replace(".", ",")}
                  </p>
                  {product.compare_at_price && product.compare_at_price > product.price && (
                    <p className="text-xl text-muted-foreground line-through">
                      R$ {product.compare_at_price.toFixed(2).replace(".", ",")}
                    </p>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  ou 12x de R$ {(product.price / 12).toFixed(2).replace(".", ",")} sem juros
                </p>
              </div>

              {product.description && (
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              )}

              {product.shipping_time && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Truck className="h-4 w-4" />
                  <span>Entrega estimada: {product.shipping_time}</span>
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
                  disabled={!product.in_stock}
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  {product.in_stock ? "Adicionar ao Carrinho" : "Indisponível"}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={handleToggleFavorite}
                  className={isFavorite ? "text-primary border-primary" : ""}
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? "fill-primary" : ""}`} />
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
                    <p className="text-xs text-muted-foreground">Acima de R$ 199</p>
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