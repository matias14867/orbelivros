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
import { ShoppingBag, Minus, Plus, Trash2, CreditCard, Loader2 } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const CartDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { 
    items, 
    updateQuantity, 
    removeItem, 
    getTotalItems,
    getTotalPrice
  } = useCartStore();
  
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  // ==========================================
  // STRIPE CHECKOUT (comentado - mantido para uso futuro)
  // ==========================================
  // const handleStripeCheckout = async () => {
  //   if (items.length === 0) return;

  //   setIsProcessing(true);
  //   try {
  //     // Format items for Stripe checkout
  //     const checkoutItems = items.map(item => ({
  //       name: item.product.node.title,
  //       price: parseFloat(item.price.amount),
  //       quantity: item.quantity,
  //       image: item.product.node.images?.edges?.[0]?.node?.url || undefined,
  //     }));

  //     const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
  //       body: { items: checkoutItems },
  //     });

  //     if (error) {
  //       throw new Error(error.message);
  //     }

  //     if (data?.url) {
  //       window.open(data.url, '_blank');
  //       setIsOpen(false);
  //     } else {
  //       throw new Error('No checkout URL returned');
  //     }
  //   } catch (error) {
  //     console.error('Stripe checkout failed:', error);
  //     toast.error("Erro ao criar checkout", {
  //       description: "Por favor, tente novamente."
  //     });
  //   } finally {
  //     setIsProcessing(false);
  //   }
  // };

  // ==========================================
  // PAGBANK CHECKOUT (ativo)
  // ==========================================
  const handlePagBankCheckout = async () => {
    if (items.length === 0) return;

    setIsProcessing(true);
    try {
      // Format items for PagBank checkout
      const checkoutItems = items.map(item => ({
        name: item.product.node.title,
        price: parseFloat(item.price.amount),
        quantity: item.quantity,
        image: item.product.node.images?.edges?.[0]?.node?.url || undefined,
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
      
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle className="font-serif">Seu Carrinho</SheetTitle>
          <SheetDescription>
            {totalItems === 0 ? "Seu carrinho está vazio" : `${totalItems} item${totalItems !== 1 ? 's' : ''} no carrinho`}
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex flex-col flex-1 pt-6 min-h-0">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Seu carrinho está vazio</p>
                <p className="text-sm text-muted-foreground mt-2">Adicione livros para continuar</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto pr-2 min-h-0">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.variantId} className="flex gap-4 p-3 bg-card rounded-xl">
                      <div className="w-16 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        {item.product.node.images?.edges?.[0]?.node && (
                          <img
                            src={item.product.node.images.edges[0].node.url}
                            alt={item.product.node.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif font-medium text-sm leading-tight truncate">
                          {item.product.node.title}
                        </h4>
                        {item.variantTitle !== "Default Title" && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.variantTitle}
                          </p>
                        )}
                        <p className="font-semibold text-primary mt-2">
                          R$ {parseFloat(item.price.amount).toFixed(2).replace(".", ",")}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(item.variantId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex-shrink-0 space-y-4 pt-4 border-t border-border bg-background">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-serif font-semibold">Total</span>
                  <span className="text-xl font-bold text-primary">
                    R$ {totalPrice.toFixed(2).replace(".", ",")}
                  </span>
                </div>
                
                <Button 
                  onClick={handlePagBankCheckout}
                  variant="hero"
                  className="w-full" 
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
                <p className="text-xs text-center text-muted-foreground">
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
