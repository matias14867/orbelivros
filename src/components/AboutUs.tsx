import { useSiteTexts } from "@/hooks/useSiteTexts";
import { useSiteImages } from "@/hooks/useSiteImages";
import aboutImageDefault from "@/assets/about-cozy.jpg";
import { BookOpen } from "lucide-react";

const AboutUs = () => {
  const { getSection } = useSiteTexts();
  const texts = getSection("about");
  const { getImage } = useSiteImages();
  const aboutImage = getImage("aboutImage") || aboutImageDefault;

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={aboutImage}
          alt="Ambiente aconchegante de leitura"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
      </div>

      <div className="container relative z-10">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <BookOpen className="h-4 w-4" />
            {texts.badge || "Quem Somos"}
          </span>

          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">
            {texts.title || "Sua Livraria de Confiança"}
          </h2>

          <p className="text-muted-foreground text-lg leading-relaxed mb-6">
            {texts.paragraph1 || "Somos apaixonados por livros e acreditamos no poder transformador da leitura. Nossa missão é conectar leitoras a histórias que inspiram, emocionam e fazem refletir."}
          </p>

          <p className="text-muted-foreground leading-relaxed">
            {texts.paragraph2 || "Cada livro em nossa curadoria foi escolhido com carinho, pensando em você que busca momentos de paz, conhecimento e aventura entre as páginas."}
          </p>

          {texts.quote && (
            <blockquote className="mt-8 pl-6 border-l-4 border-primary italic text-foreground/80">
              "{texts.quote}"
              {texts.quoteAuthor && (
                <footer className="mt-2 text-sm text-muted-foreground not-italic">
                  — {texts.quoteAuthor}
                </footer>
              )}
            </blockquote>
          )}
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
