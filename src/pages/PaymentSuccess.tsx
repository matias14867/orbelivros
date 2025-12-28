import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, Home, ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const referenceId = searchParams.get("reference_id");
  const sessionId = searchParams.get("session_id");
  const { items, clearCart } = useCartStore();
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [recorded, setRecorded] = useState(false);

  useEffect(() => {
    const recordPurchase = async () => {
      // Only record if user is logged in and we have items and a reference
      if (!user || items.length === 0 || recorded) {
        clearCart();
        return;
      }

      const orderRef = referenceId || sessionId || `order_${Date.now()}`;
      
      setIsRecording(true);
      try {
        // Format items for the edge function
        const purchaseItems = items.map(item => ({
          name: item.product.node.title,
          price: parseFloat(item.price.amount),
          quantity: item.quantity,
          image: item.product.node.images?.edges?.[0]?.node?.url || undefined,
          handle: item.product.node.handle,
        }));

        const { error } = await supabase.functions.invoke('record-purchase', {
          body: { 
            referenceId: orderRef,
            items: purchaseItems 
          },
        });

        if (error) {
          console.error('Error recording purchase:', error);
        } else {
          console.log('Purchase recorded successfully');
          setRecorded(true);
        }
      } catch (error) {
        console.error('Error recording purchase:', error);
      } finally {
        setIsRecording(false);
        clearCart();
      }
    };

    recordPurchase();
  }, [user, items, referenceId, sessionId, clearCart, recorded]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-green-100 dark:bg-green-900/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            {isRecording ? (
              <Loader2 className="w-10 h-10 text-green-600 dark:text-green-400 animate-spin" />
            ) : (
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            )}
          </div>
          
          <h1 className="font-serif text-3xl font-bold text-foreground mb-4">
            {isRecording ? "Processando..." : "Pagamento Confirmado!"}
          </h1>
          
          <p className="text-muted-foreground mb-8">
            {isRecording 
              ? "Registrando sua compra no histórico..."
              : "Obrigado pela sua compra! Você receberá um e-mail com os detalhes do seu pedido."
            }
          </p>

          {(referenceId || sessionId) && !isRecording && (
            <p className="text-sm text-muted-foreground mb-8">
              ID da transação: <code className="bg-muted px-2 py-1 rounded text-xs">{referenceId || sessionId}</code>
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="hero" disabled={isRecording}>
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Voltar ao Início
              </Link>
            </Button>
            <Button asChild variant="outline" disabled={isRecording}>
              <Link to="/all-books">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Continuar Comprando
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
