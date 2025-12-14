import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useBooks } from "@/hooks/useBooks";
import { 
  Heart, 
  BookOpen, 
  Lightbulb, 
  Star, 
  Coffee, 
  Flower2, 
  Sparkles, 
  BookText,
  Globe,
  Baby,
  Skull,
  ChevronRight
} from "lucide-react";

const categoryData = [
  {
    name: "Romance",
    description: "Histórias de amor apaixonantes que aquecem o coração",
    icon: Heart,
    color: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
    bgGradient: "from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20",
  },
  {
    name: "Autoajuda",
    description: "Cresça, evolua e transforme sua vida",
    icon: Lightbulb,
    color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    bgGradient: "from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20",
  },
  {
    name: "Ficção",
    description: "Mundos extraordinários e histórias envolventes",
    icon: BookOpen,
    color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    bgGradient: "from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20",
  },
  {
    name: "Fantasia",
    description: "Aventuras mágicas em reinos encantados",
    icon: Sparkles,
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    bgGradient: "from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20",
  },
  {
    name: "Clássicos",
    description: "Literatura atemporal que atravessa gerações",
    icon: Coffee,
    color: "bg-stone-200 text-stone-600 dark:bg-stone-800/50 dark:text-stone-400",
    bgGradient: "from-stone-50 to-zinc-50 dark:from-stone-950/20 dark:to-zinc-950/20",
  },
  {
    name: "Poesia",
    description: "Versos e emoções que tocam a alma",
    icon: Star,
    color: "bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400",
    bgGradient: "from-sky-50 to-blue-50 dark:from-sky-950/20 dark:to-blue-950/20",
  },
  {
    name: "Drama",
    description: "Emoções intensas e histórias marcantes",
    icon: Flower2,
    color: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
    bgGradient: "from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20",
  },
  {
    name: "Distopia",
    description: "Futuros alternativos e sociedades intrigantes",
    icon: BookText,
    color: "bg-slate-200 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400",
    bgGradient: "from-slate-50 to-gray-50 dark:from-slate-950/20 dark:to-gray-950/20",
  },
  {
    name: "Literatura Brasileira",
    description: "O melhor da nossa literatura nacional",
    icon: Globe,
    color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    bgGradient: "from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20",
  },
  {
    name: "Infantojuvenil",
    description: "Aventuras mágicas para jovens leitores",
    icon: Baby,
    color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
    bgGradient: "from-cyan-50 to-teal-50 dark:from-cyan-950/20 dark:to-teal-950/20",
  },
  {
    name: "Tragédia",
    description: "Obras clássicas sobre a condição humana",
    icon: Skull,
    color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    bgGradient: "from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20",
  },
];

const CategoriesPage = () => {
  const { books } = useBooks();

  // Count books per category
  const categoryCounts = categoryData.map((category) => {
    const count = books.filter((book) => book.category === category.name).length;
    return { ...category, count };
  });

  return (
    <>
      <Helmet>
        <title>Categorias | Orbe Livros</title>
        <meta
          name="description"
          content="Explore todas as categorias de livros da Orbe Livros. Romance, fantasia, clássicos, autoajuda e muito mais."
        />
      </Helmet>

      <Header />

      <main className="min-h-screen pt-24">
        {/* Hero Section */}
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
                Encontre o livro perfeito para cada momento da sua vida
              </p>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-12 md:py-16">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryCounts.map((category, index) => (
                <Link
                  key={category.name}
                  to={`/livros?categoria=${encodeURIComponent(category.name)}`}
                  className={`group relative p-6 rounded-2xl bg-gradient-to-br ${category.bgGradient} border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 animate-fade-up`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 ${category.color} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <category.icon className="h-7 w-7" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h2 className="font-serif text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                          {category.name}
                        </h2>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                      <p className="text-muted-foreground text-sm mt-1">
                        {category.description}
                      </p>
                      <p className="text-primary font-medium text-sm mt-3">
                        {category.count} {category.count === 1 ? "livro" : "livros"}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-16 bg-muted/50">
          <div className="container">
            <div className="text-center max-w-xl mx-auto">
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">
                Não encontrou o que procura?
              </h2>
              <p className="text-muted-foreground mb-6">
                Explore nossa coleção completa com mais de {books.length} livros disponíveis
              </p>
              <Link
                to="/livros"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition-colors"
              >
                Ver Todos os Livros
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