import { Link } from "react-router-dom";
import { useCurrentMonthPicks } from "@/hooks/useMonthlyPicks";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen, Heart, ShoppingBag, Calendar } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useFavorites } from "@/hooks/useFavorites";
import { toast } from "sonner";

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const MonthlyPicks = () => {
  const { picks, loading } = useCurrentMonthPicks();
  const addItem = useCartStore((state) => state.addItem);
  const { isFavorite, toggleFavorite } = useFavorites();

  const currentDate = new Date();
  const monthName = MONTH_NAMES[currentDate.getMonth()];

  const handleAddToCart = (book: any) => {
    addItem({
      product: {
        node: {
          id: book.id,
          handle: book.handle,
          title: book.title,
          description: book.description || "",
          images: { edges: [{ node: { url: book.image_url || "", altText: book.title } }] },
          priceRange: { minVariantPrice: { amount: String(book.price), currencyCode: "BRL" } },
          variants: { edges: [{ node: { id: book.id, title: "Default", price: { amount: String(book.price), currencyCode: "BRL" }, availableForSale: true, selectedOptions: [] } }] },
          options: [],
        },
      },
      variantId: book.id,
      variantTitle: "Default",
      price: { amount: String(book.price), currencyCode: "BRL" },
      quantity: 1,
      selectedOptions: [],
    });
    toast.success("Adicionado ao carrinho!", { description: book.title });
  };

  const handleToggleFavorite = (book: any) => {
    toggleFavorite({
      handle: book.handle,
      title: book.title,
      image: book.image_url,
      price: book.price,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (picks.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-2 bg-accent/20 text-accent-foreground px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Calendar className="h-4 w-4" />
          Indicados de {monthName}
        </span>
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-2">
          Nossas Escolhas do Mês
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Livros especialmente selecionados pela nossa equipe para você descobrir neste mês
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {picks.map(({ book, description }) => (
          <Card
            key={book!.id}
            className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300"
          >
            <CardContent className="p-0">
              <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                <Badge className="absolute top-3 left-3 z-10 bg-accent text-accent-foreground">
                  <BookOpen className="h-3 w-3 mr-1" />
                  Indicado
                </Badge>

                <button
                  onClick={() => handleToggleFavorite(book)}
                  className="absolute top-3 right-3 z-10 w-9 h-9 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:bg-background"
                >
                  <Heart
                    className={`h-5 w-5 ${
                      isFavorite(book!.handle)
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>

                <Link to={`/produto/${book!.handle}`}>
                  {book!.image_url ? (
                    <img
                      src={book!.image_url}
                      alt={book!.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                </Link>

                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-background/90 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <Button
                    variant="hero"
                    size="sm"
                    className="w-full"
                    onClick={() => handleAddToCart(book)}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Adicionar
                  </Button>
                </div>
              </div>

              <div className="p-4">
                <Link to={`/produto/${book!.handle}`}>
                  <h3 className="font-medium text-foreground line-clamp-2 mb-1 hover:text-primary transition-colors">
                    {book!.title}
                  </h3>
                </Link>
                <p className="text-sm text-muted-foreground mb-2">{book!.author}</p>
                <p className="font-bold text-primary">
                  R$ {book!.price.toFixed(2).replace(".", ",")}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default MonthlyPicks;
