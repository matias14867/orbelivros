import { Heart, BookOpen, Lightbulb, Star, Coffee, Flower2, Sparkles, BookText } from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  {
    name: "Romance",
    description: "Histórias de amor apaixonantes",
    icon: Heart,
    color: "bg-rose-light text-rose-dark",
    filter: "Romance",
  },
  {
    name: "Autoajuda",
    description: "Cresça e evolua",
    icon: Lightbulb,
    color: "bg-gold-light text-gold",
    filter: "Autoajuda",
  },
  {
    name: "Ficção",
    description: "Mundos extraordinários",
    icon: BookOpen,
    color: "bg-sage-light text-sage-dark",
    filter: "Ficção",
  },
  {
    name: "Fantasia",
    description: "Aventuras mágicas",
    icon: Sparkles,
    color: "bg-purple-100 text-purple-700",
    filter: "Fantasia",
  },
  {
    name: "Clássicos",
    description: "Literatura atemporal",
    icon: Coffee,
    color: "bg-muted text-muted-foreground",
    filter: "Clássicos",
  },
  {
    name: "Poesia",
    description: "Versos e emoções",
    icon: Star,
    color: "bg-accent text-accent-foreground",
    filter: "Poesia",
  },
  {
    name: "Drama",
    description: "Emoções intensas",
    icon: Flower2,
    color: "bg-secondary text-secondary-foreground",
    filter: "Drama",
  },
  {
    name: "Distopia",
    description: "Futuros alternativos",
    icon: BookText,
    color: "bg-slate-200 text-slate-700",
    filter: "Distopia",
  },
];

const Categories = () => {
  return (
    <section id="categorias" className="py-20 md:py-28 bg-cream-dark">
      <div className="container">
        <div className="text-center mb-14">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Navegue por
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-2 mb-4">
            Categorias Populares
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Encontre o livro perfeito para cada momento da sua vida
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((category, index) => (
            <Link
              key={category.name}
              to={`/livros?categoria=${encodeURIComponent(category.filter)}`}
              className="group p-4 md:p-6 bg-card rounded-2xl shadow-card hover-lift text-center animate-fade-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div
                className={`w-12 h-12 md:w-14 md:h-14 ${category.color} rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                <category.icon className="h-6 w-6 md:h-7 md:w-7" />
              </div>
              <h3 className="font-serif font-semibold text-foreground text-sm md:text-base mb-1">
                {category.name}
              </h3>
              <p className="text-muted-foreground text-xs hidden md:block">
                {category.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
