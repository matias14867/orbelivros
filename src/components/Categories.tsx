import { Heart, BookOpen, Lightbulb, Star, Coffee, Flower2 } from "lucide-react";

const categories = [
  {
    name: "Romance",
    description: "Histórias de amor apaixonantes",
    icon: Heart,
    count: "850+ livros",
    color: "bg-rose-light text-rose-dark",
  },
  {
    name: "Desenvolvimento",
    description: "Cresça e evolua",
    icon: Lightbulb,
    count: "420+ livros",
    color: "bg-gold-light text-gold",
  },
  {
    name: "Ficção",
    description: "Mundos extraordinários",
    icon: BookOpen,
    count: "630+ livros",
    color: "bg-sage-light text-sage-dark",
  },
  {
    name: "Best-sellers",
    description: "Os mais vendidos",
    icon: Star,
    count: "200+ livros",
    color: "bg-accent text-accent-foreground",
  },
  {
    name: "Bem-estar",
    description: "Cuide de você",
    icon: Flower2,
    count: "310+ livros",
    color: "bg-secondary text-secondary-foreground",
  },
  {
    name: "Clássicos",
    description: "Literatura atemporal",
    icon: Coffee,
    count: "180+ livros",
    color: "bg-muted text-muted-foreground",
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <a
              key={category.name}
              href="#"
              className="group p-6 bg-card rounded-2xl shadow-card hover-lift text-center animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`w-14 h-14 ${category.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                <category.icon className="h-7 w-7" />
              </div>
              <h3 className="font-serif font-semibold text-foreground mb-1">
                {category.name}
              </h3>
              <p className="text-muted-foreground text-sm mb-2">
                {category.description}
              </p>
              <span className="text-primary text-xs font-medium">
                {category.count}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
