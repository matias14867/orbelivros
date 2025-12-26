import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import heroImageDefault from "@/assets/hero-books.jpg";
import { useNavigate } from "react-router-dom";
import { useSiteTexts } from "@/hooks/useSiteTexts";
import { useSiteImages } from "@/hooks/useSiteImages";

const Hero = () => {
  const navigate = useNavigate();
  const { getSection } = useSiteTexts();
  const texts = getSection("hero");
  const { getImage } = useSiteImages();
  const heroImage = getImage("heroImage") || heroImageDefault;
  
  return (
    <section className="relative min-h-[100dvh] flex items-center pt-16 sm:pt-20 pb-8 sm:pb-0">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Estante de livros aconchegante"
          className="w-full h-full object-cover brightness-110 contrast-105 saturate-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-foreground/20 sm:from-foreground/70 sm:via-foreground/40 sm:to-transparent" />
      </div>

      {/* Content */}
      <div className="container relative z-10 px-4 sm:px-6">
        <div className="max-w-2xl">
          <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <span className="inline-flex items-center gap-1.5 sm:gap-2 bg-primary/20 backdrop-blur-sm text-primary-foreground px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
              {texts.badge}
            </span>
          </div>

          <h1
            className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-primary-foreground leading-tight mb-4 sm:mb-6 animate-fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            {texts.title}{" "}
            <span className="text-rose-light italic">{texts.titleHighlight}</span>
          </h1>

          <p
            className="text-primary-foreground/80 text-sm sm:text-lg md:text-xl mb-6 sm:mb-8 leading-relaxed animate-fade-up max-w-xl"
            style={{ animationDelay: "0.3s" }}
          >
            {texts.subtitle}
          </p>

          <div
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-fade-up"
            style={{ animationDelay: "0.4s" }}
          >
            <Button variant="hero" size="lg" className="w-full sm:w-auto min-h-[44px] text-sm sm:text-base" onClick={() => navigate("/livros")}>
              {texts.buttonPrimary}
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button variant="heroOutline" size="lg" className="w-full sm:w-auto min-h-[44px] text-sm sm:text-base" onClick={() => navigate("/livros")}>
              {texts.buttonSecondary}
            </Button>
          </div>

          {/* Stats */}
          <div
            className="grid grid-cols-3 gap-3 sm:gap-6 mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-primary-foreground/20 animate-fade-up"
            style={{ animationDelay: "0.5s" }}
          >
            <div>
              <p className="font-serif text-xl sm:text-3xl md:text-4xl font-bold text-primary-foreground">
                {texts.stat1Value}
              </p>
              <p className="text-primary-foreground/70 text-[10px] sm:text-sm">{texts.stat1Label}</p>
            </div>
            <div>
              <p className="font-serif text-xl sm:text-3xl md:text-4xl font-bold text-primary-foreground">
                {texts.stat2Value}
              </p>
              <p className="text-primary-foreground/70 text-[10px] sm:text-sm">{texts.stat2Label}</p>
            </div>
            <div>
              <p className="font-serif text-xl sm:text-3xl md:text-4xl font-bold text-primary-foreground">
                {texts.stat3Value}
              </p>
              <p className="text-primary-foreground/70 text-[10px] sm:text-sm">{texts.stat3Label}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
