import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-books.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Estante de livros aconchegante"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="container relative z-10">
        <div className="max-w-2xl">
          <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <span className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm text-primary-foreground px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Nova coleção disponível
            </span>
          </div>

          <h1
            className="font-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-primary-foreground leading-tight mb-6 animate-fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            Descubra seu próximo{" "}
            <span className="text-rose-light italic">livro favorito</span>
          </h1>

          <p
            className="text-primary-foreground/80 text-lg md:text-xl mb-8 leading-relaxed animate-fade-up max-w-xl"
            style={{ animationDelay: "0.3s" }}
          >
            Explore nossa curadoria especial de livros selecionados para mulheres
            que amam ler. Romances, desenvolvimento pessoal, ficção e muito mais.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 animate-fade-up"
            style={{ animationDelay: "0.4s" }}
          >
            <Button variant="hero" size="xl">
              Explorar Livros
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button variant="heroOutline" size="xl">
              Ver Ofertas
            </Button>
          </div>

          {/* Stats */}
          <div
            className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-primary-foreground/20 animate-fade-up"
            style={{ animationDelay: "0.5s" }}
          >
            <div>
              <p className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground">
                5k+
              </p>
              <p className="text-primary-foreground/70 text-sm">Livros</p>
            </div>
            <div>
              <p className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground">
                10k+
              </p>
              <p className="text-primary-foreground/70 text-sm">Clientes</p>
            </div>
            <div>
              <p className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground">
                4.9
              </p>
              <p className="text-primary-foreground/70 text-sm">Avaliação</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
