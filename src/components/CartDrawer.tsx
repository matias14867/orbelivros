import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingBag, Minus, Plus, Trash2, CreditCard, Loader2, LogIn, Package } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export const CartDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    items, 
    updateQuantity, 
    removeItem, 
    getTotalItems,
    getTotalPrice
  } = useCartStore();
  
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  const handlePagBankCheckout = async () => {
    if (items.length === 0) return;

    if (!user) {
      toast.error("Faça login para continuar", {
        description: "Você precisa estar logado para finalizar a compra."
      });
      setIsOpen(false);
      navigate("/auth");
      return;
    }

    setIsProcessing(true);
    try {
      const checkoutItems = items.map(item => ({
        name: item.product.title,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image_url || undefined,
        handle: item.product.handle,
      }));

      const { data, error } = await supabase.functions.invoke('create-pagbank-checkout', {
        body: { items: checkoutItems },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        window.open(data.url, '_blank');
        setIsOpen(false);
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('PagBank checkout failed:', error);
      toast.error("Erro ao criar checkout", {
        description: "Por favor, tente novamente."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingBag className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-[90vw] max-w-lg flex flex-col h-[100dvh] p-3 sm:p-6">
        <SheetHeader className="flex-shrink-0 pb-2">
          <SheetTitle className="font-serif text-base sm:text-lg">Seu Carrinho</SheetTitle>
          <SheetDescription className="text-xs sm:text-sm">
            {totalItems === 0 ? "Seu carrinho está vazio" : `${totalItems} item${totalItems !== 1 ? 's' : ''} no carrinho`}
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex flex-col flex-1 pt-3 sm:pt-6 min-h-0 overflow-hidden">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Package className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                <p className="text-muted-foreground text-sm sm:text-base">Seu carrinho está vazio</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">Adicione produtos para continuar</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 min-h-0">
                <div className="space-y-3 sm:space-y-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-2 sm:gap-4 p-2 sm:p-3 bg-card rounded-xl">
                      <div className="w-12 h-16 sm:w-16 sm:h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        {item.product.image_url ? (
                          <img
                            src={item.product.image_url}
                            alt={item.product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif font-medium text-xs sm:text-sm leading-tight line-clamp-2">
                          {item.product.title}
                        </h4>
                        <p className="font-semibold text-primary mt-1 sm:mt-2 text-sm sm:text-base">
                          R$ {item.product.price.toFixed(2).replace(".", ",")}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1 sm:gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(item.product.id)}
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        
                        <div className="flex items-center gap-0.5 sm:gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 sm:h-7 sm:w-7"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          </Button>
                          <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 sm:h-7 sm:w-7"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            <Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex-shrink-0 space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t border-border bg-background mt-auto">
                <div className="flex justify-between items-center">
                  <span className="text-base sm:text-lg font-serif font-semibold">Total</span>
                  <span className="text-lg sm:text-xl font-bold text-primary">
                    R$ {totalPrice.toFixed(2).replace(".", ",")}
                  </span>
                </div>
                
                {!user ? (
                  <Button 
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/auth");
                    }}
                    variant="hero"
                    className="w-full min-h-[44px] text-sm sm:text-base" 
                    size="lg"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Faça login para comprar
                  </Button>
                ) : (
                  <Button 
                    onClick={handlePagBankCheckout}
                    variant="hero"
                    className="w-full min-h-[44px] text-sm sm:text-base" 
                    size="lg"
                    disabled={items.length === 0 || isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Finalizar Compra
                      </>
                    )}
                  </Button>
                )}
                <p className="text-[10px] sm:text-xs text-center text-muted-foreground pb-safe">
                  Pagamento seguro via PagBank - PIX, Boleto ou Cartão
                </p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
