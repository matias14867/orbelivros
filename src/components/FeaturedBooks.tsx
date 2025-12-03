import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, Star } from "lucide-react";

const books = [
  {
    id: 1,
    title: "O Amor nos Tempos do Cólera",
    author: "Gabriel García Márquez",
    price: 54.90,
    originalPrice: 69.90,
    rating: 4.9,
    reviews: 328,
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
    badge: "Best-seller",
  },
  {
    id: 2,
    title: "Mulheres que Correm com os Lobos",
    author: "Clarissa Pinkola Estés",
    price: 62.90,
    originalPrice: null,
    rating: 4.8,
    reviews: 512,
    image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop",
    badge: "Novo",
  },
  {
    id: 3,
    title: "A Paciente Silenciosa",
    author: "Alex Michaelides",
    price: 44.90,
    originalPrice: 59.90,
    rating: 4.7,
    reviews: 891,
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop",
    badge: "Oferta",
  },
  {
    id: 4,
    title: "Orgulho e Preconceito",
    author: "Jane Austen",
    price: 34.90,
    originalPrice: null,
    rating: 4.9,
    reviews: 1203,
    image: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&h=600&fit=crop",
    badge: "Clássico",
  },
];

const FeaturedBooks = () => {
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
          <Button variant="outline" size="lg" className="mt-6 md:mt-0">
            Ver Todos
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {books.map((book, index) => (
            <article
              key={book.id}
              className="group animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative overflow-hidden rounded-2xl bg-card mb-4">
                {/* Badge */}
                <span className="absolute top-4 left-4 z-10 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                  {book.badge}
                </span>

                {/* Wishlist Button */}
                <button className="absolute top-4 right-4 z-10 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-background">
                  <Heart className="h-5 w-5 text-primary" />
                </button>

                {/* Image */}
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={book.image}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Quick Add */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-foreground/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <Button variant="hero" size="sm" className="w-full">
                    <ShoppingBag className="h-4 w-4" />
                    Adicionar
                  </Button>
                </div>
              </div>

              {/* Info */}
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <Star className="h-4 w-4 fill-gold text-gold" />
                  <span className="text-sm font-medium text-foreground">
                    {book.rating}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({book.reviews})
                  </span>
                </div>

                <h3 className="font-serif font-semibold text-foreground text-lg leading-tight mb-1 group-hover:text-primary transition-colors">
                  {book.title}
                </h3>

                <p className="text-muted-foreground text-sm mb-3">
                  {book.author}
                </p>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-primary text-lg">
                    R$ {book.price.toFixed(2).replace(".", ",")}
                  </span>
                  {book.originalPrice && (
                    <span className="text-muted-foreground text-sm line-through">
                      R$ {book.originalPrice.toFixed(2).replace(".", ",")}
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedBooks;
