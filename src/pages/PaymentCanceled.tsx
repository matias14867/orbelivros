import { Link } from "react-router-dom";
import { XCircle, Home, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PaymentCanceled = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-amber-100 dark:bg-amber-900/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-amber-600 dark:text-amber-400" />
          </div>
          
          <h1 className="font-serif text-3xl font-bold text-foreground mb-4">
            Pagamento Cancelado
          </h1>
          
          <p className="text-muted-foreground mb-8">
            Seu pagamento foi cancelado. Não se preocupe, os itens ainda estão no seu carrinho.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="hero">
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Voltar ao Início
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/all-books">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Ver Livros
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentCanceled;
