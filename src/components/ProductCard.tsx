import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag } from "lucide-react";
import { Product } from "@/hooks/useProducts";
import { useCartStore } from "@/stores/cartStore";
import { useFavorites } from "@/hooks/useFavorites";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const addItem = useCartStore(state => state.addItem);
  const { isFavorite, toggleFavorite } = useFavorites();
  
  const isProductFavorite = isFavorite(product.handle);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem(product);
    toast.success("Adicionado ao carrinho!", {
      description: product.title,
      position: "top-center"
    });
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    await toggleFavorite({
      handle: product.handle,
      title: product.title,
      image: product.image_url || undefined,
      price: product.price,
    });
  };

  return (
    <article
      className="group animate-fade-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <Link to={`/produto/${product.handle}`}>
        <div className="relative overflow-hidden rounded-2xl bg-card mb-4">
          <button 
            className={`absolute top-4 right-4 z-10 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:bg-background ${
              isProductFavorite ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
            onClick={handleToggleFavorite}
          >
            <Heart 
              className={`h-5 w-5 transition-colors ${
                isProductFavorite 
                  ? "fill-primary text-primary" 
                  : "text-muted-foreground hover:text-primary"
              }`} 
            />
          </button>

          <div className="aspect-[3/4] overflow-hidden bg-muted">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <ShoppingBag className="h-12 w-12" />
              </div>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-foreground/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <Button 
              variant="hero" 
              size="sm" 
              className="w-full"
              onClick={handleAddToCart}
              disabled={!product.in_stock}
            >
              <ShoppingBag className="h-4 w-4" />
              {product.in_stock ? "Adicionar" : "Indisponível"}
            </Button>
          </div>
        </div>

        <div>
          <h3 className="font-serif font-semibold text-foreground text-lg leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-2">
            {product.title}
          </h3>

          {product.description && (
            <p className="text-muted-foreground text-sm mb-3 line-clamp-1">
              {product.description}
            </p>
          )}

          <div className="flex items-center gap-2">
            <span className="font-bold text-primary text-lg">
              R$ {product.price.toFixed(2).replace(".", ",")}
            </span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-sm text-muted-foreground line-through">
                R$ {product.compare_at_price.toFixed(2).replace(".", ",")}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
};
