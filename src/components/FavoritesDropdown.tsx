import { Link, useNavigate } from "react-router-dom";
import { Heart, X, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFavorites } from "@/hooks/useFavorites";
import { useCartStore } from "@/stores/cartStore";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

export const FavoritesDropdown = () => {
  const { user } = useAuth();
  const { favorites, removeFavorite, loading } = useFavorites();
  const addItem = useCartStore((state) => state.addItem);
  const navigate = useNavigate();

  const handleAddToCart = (favorite: typeof favorites[0], e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const cartItem = {
      product: {
        node: {
          id: `fav-${favorite.id}`,
          title: favorite.product_title,
          description: "",
          handle: favorite.product_handle,
          priceRange: {
            minVariantPrice: {
              amount: String(favorite.product_price || 0),
              currencyCode: "BRL",
            },
          },
          images: {
            edges: favorite.product_image ? [{ node: { url: favorite.product_image, altText: favorite.product_title } }] : [],
          },
          variants: {
            edges: [{
              node: {
                id: `gid://shopify/ProductVariant/fav-${favorite.id}`,
                title: "Default",
                price: { amount: String(favorite.product_price || 0), currencyCode: "BRL" },
                availableForSale: true,
                selectedOptions: [],
              }
            }],
          },
          options: [],
        },
      },
      variantId: `gid://shopify/ProductVariant/fav-${favorite.id}`,
      variantTitle: "Default",
      price: { amount: String(favorite.product_price || 0), currencyCode: "BRL" },
      quantity: 1,
      selectedOptions: [],
    };
    
    addItem(cartItem);
    toast.success("Adicionado ao carrinho!");
  };

  const handleRemove = async (handle: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await removeFavorite(handle);
  };

  if (!user) {
    return (
      <Button 
        variant="ghost" 
        size="icon" 
        className="hidden md:flex"
        onClick={() => navigate("/auth")}
      >
        <Heart className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="hidden md:flex relative">
          <Heart className="h-5 w-5" />
          {favorites.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {favorites.length > 9 ? "9+" : favorites.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="px-3 py-2 font-semibold text-sm border-b">
          Meus Favoritos ({favorites.length})
        </div>
        
        {favorites.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            <Heart className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhum favorito ainda</p>
            <p className="text-xs mt-1">Clique no ❤️ nos livros para salvar</p>
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-[300px]">
              {favorites.slice(0, 5).map((favorite) => (
                <DropdownMenuItem key={favorite.id} asChild className="p-0">
                  <Link 
                    to={`/produto/${favorite.product_handle}`}
                    className="flex items-center gap-3 p-3 cursor-pointer hover:bg-accent"
                  >
                    {favorite.product_image ? (
                      <img 
                        src={favorite.product_image} 
                        alt={favorite.product_title}
                        className="w-12 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-16 bg-muted rounded flex items-center justify-center">
                        <Heart className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{favorite.product_title}</p>
                      {favorite.product_price && (
                        <p className="text-sm text-primary font-semibold">
                          R$ {favorite.product_price.toFixed(2).replace(".", ",")}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={(e) => handleAddToCart(favorite, e)}
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={(e) => handleRemove(favorite.product_handle, e)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
            </ScrollArea>
            
            {favorites.length > 5 && (
              <div className="px-3 py-2 text-xs text-muted-foreground text-center border-t">
                +{favorites.length - 5} mais itens
              </div>
            )}
            
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link to="/perfil" className="w-full text-center justify-center text-primary font-medium">
                Ver todos os favoritos
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
