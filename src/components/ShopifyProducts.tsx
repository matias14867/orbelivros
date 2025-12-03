import { useEffect, useState } from "react";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen } from "lucide-react";

export const ShopifyProducts = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts(20);
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Erro ao carregar produtos");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) {
    return (
      <section id="destaques" className="py-20 md:py-28">
        <div className="container">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="destaques" className="py-20 md:py-28">
        <div className="container">
          <div className="text-center py-20">
            <p className="text-destructive">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="destaques" className="py-20 md:py-28">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-14">
          <div>
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              Curadoria especial
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-2 mb-4">
              Livros em Destaque
            </h2>
            <p className="text-muted-foreground max-w-xl">
              Selecionados especialmente para você, os títulos mais amados pelas
              nossas leitoras
            </p>
          </div>
          {products.length > 0 && (
            <Button variant="outline" size="lg" className="mt-6 md:mt-0">
              Ver Todos
            </Button>
          )}
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-serif text-2xl font-semibold text-foreground mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              A loja ainda não tem livros cadastrados. Peça para adicionar produtos no chat!
            </p>
            <p className="text-sm text-muted-foreground">
              Exemplo: "Adicione um livro chamado 'O Amor nos Tempos do Cólera' por R$ 54,90"
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((product, index) => (
              <ProductCard key={product.node.id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
