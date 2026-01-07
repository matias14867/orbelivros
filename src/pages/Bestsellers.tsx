import { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InspirationalQuote, { getRandomQuote } from "@/components/InspirationalQuote";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, Trophy } from "lucide-react";

const Bestsellers = () => {
  const { data: products, isLoading } = useProducts();
  const quote = useMemo(() => getRandomQuote(), []);

  return (
    <>
      <Helmet>
        <title>Destaques | Dropshipping Store</title>
        <meta name="description" content="Confira os produtos em destaque da nossa loja" />
      </Helmet>

      <Header />

      <main className="min-h-screen pt-24 pb-16">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <TrendingUp className="h-4 w-4" />
              Em Destaque
            </span>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Produtos em Destaque
            </h1>
            <p className="text-muted-foreground">
              Os produtos mais populares da nossa loja!
            </p>
          </div>

          <InspirationalQuote quote={quote.quote} author={quote.author} className="my-8 bg-muted/30 rounded-xl" />

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !products || products.length === 0 ? (
            <div className="text-center py-20">
              <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-serif text-2xl font-bold mb-2">
                Ainda não há produtos
              </h2>
              <p className="text-muted-foreground mb-6">
                Importe produtos do CJ Dropshipping para começar.
              </p>
              <Button asChild>
                <Link to="/produtos">Explorar Produtos</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.slice(0, 12).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Bestsellers;