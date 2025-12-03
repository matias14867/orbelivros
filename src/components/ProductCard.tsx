import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface ProductCardProps {
  product: ShopifyProduct;
  index?: number;
}

export const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const addItem = useCartStore(state => state.addItem);
  const { node } = product;
  
  const firstVariant = node.variants.edges[0]?.node;
  const price = parseFloat(node.priceRange.minVariantPrice.amount);
  const imageUrl = node.images.edges[0]?.node.url;
  const imageAlt = node.images.edges[0]?.node.altText || node.title;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!firstVariant) return;

    const cartItem = {
      product,
      variantId: firstVariant.id,
      variantTitle: firstVariant.title,
      price: firstVariant.price,
      quantity: 1,
      selectedOptions: firstVariant.selectedOptions || []
    };
    
    addItem(cartItem);
    toast.success("Adicionado ao carrinho!", {
      description: node.title,
      position: "top-center"
    });
  };

  return (
    <article
      className="group animate-fade-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <Link to={`/produto/${node.handle}`}>
        <div className="relative overflow-hidden rounded-2xl bg-card mb-4">
          <button 
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-background"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Heart className="h-5 w-5 text-primary" />
          </button>

          <div className="aspect-[3/4] overflow-hidden bg-muted">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={imageAlt}
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
            >
              <ShoppingBag className="h-4 w-4" />
              Adicionar
            </Button>
          </div>
        </div>

        <div>
          <h3 className="font-serif font-semibold text-foreground text-lg leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-2">
            {node.title}
          </h3>

          {node.description && (
            <p className="text-muted-foreground text-sm mb-3 line-clamp-1">
              {node.description}
            </p>
          )}

          <div className="flex items-center gap-2">
            <span className="font-bold text-primary text-lg">
              R$ {price.toFixed(2).replace(".", ",")}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
};
