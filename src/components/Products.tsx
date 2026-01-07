import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface ProductsProps {
  category?: string;
  limit?: number;
  showViewAll?: boolean;
  title?: string;
}

export const Products = ({ 
  category, 
  limit = 8, 
  showViewAll = true,
  title = "Produtos em Destaque"
}: ProductsProps) => {
  const { data: products, isLoading, error } = useProducts(category);

  if (error) {
    return (
      <section className="py-12 px-4">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground">Erro ao carregar produtos.</p>
        </div>
      </section>
    );
  }

  const displayProducts = products?.slice(0, limit) || [];

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
          {showViewAll && products && products.length > limit && (
            <Button variant="ghost" asChild>
              <Link to="/produtos" className="gap-2">
                Ver todos <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Nenhum produto encontrado.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Importe produtos do CJ Dropshipping na área de administração.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};