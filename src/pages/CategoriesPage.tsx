import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useProducts, useProductCategories } from "@/hooks/useProducts";
import { 
  Package,
  ChevronRight
} from "lucide-react";

const CategoriesPage = () => {
  const { data: products } = useProducts();
  const { data: categories } = useProductCategories();

  const categoryCounts = (categories || []).map((category) => {
    const count = (products || []).filter((p) => p.category === category).length;
    return { name: category, count };
  });

  return (
    <>
      <Helmet>
        <title>Categorias | Dropshipping Store</title>
        <meta name="description" content="Explore todas as categorias de produtos da nossa loja." />
      </Helmet>

      <Header />

      <main className="min-h-screen pt-24">
        <section className="bg-gradient-to-b from-primary/10 to-background py-16">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-primary font-medium text-sm uppercase tracking-wider">
                Navegue por
              </span>
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
                Categorias
              </h1>
              <p className="text-muted-foreground text-lg">
                Encontre o produto perfeito para você
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container">
            {categoryCounts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma categoria encontrada.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Importe produtos para ver as categorias.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryCounts.map((category, index) => (
                  <Link
                    key={category.name}
                    to={`/produtos?categoria=${encodeURIComponent(category.name)}`}
                    className="group relative p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-serif text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                          {category.name}
                        </h2>
                        <p className="text-primary font-medium text-sm mt-2">
                          {category.count} {category.count === 1 ? "produto" : "produtos"}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="py-12 md:py-16 bg-muted/50">
          <div className="container">
            <div className="text-center max-w-xl mx-auto">
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">
                Não encontrou o que procura?
              </h2>
              <p className="text-muted-foreground mb-6">
                Explore nossa coleção completa com mais de {products?.length || 0} produtos
              </p>
              <Link
                to="/produtos"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition-colors"
              >
                Ver Todos os Produtos
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default CategoriesPage;