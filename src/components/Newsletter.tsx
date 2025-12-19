import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSiteTexts } from "@/hooks/useSiteTexts";
import lavenderField from "@/assets/lavender-field.jpg";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  const { getSection } = useSiteTexts();
  const texts = getSection("newsletter");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({
        title: "Inscrição realizada! 💕",
        description: "Em breve você receberá nossas novidades.",
      });
      setEmail("");
    }
  };

  return (
    <section id="newsletter" className="py-20 md:py-28 relative overflow-hidden">
      {/* Background Image with Heavy Blur */}
      <div className="absolute inset-0 z-0">
        <img
          src={lavenderField}
          alt="Campo de lavanda"
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-foreground/70" />
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl z-[1]" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-rose/10 rounded-full blur-3xl z-[1]" />

      <div className="container relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/20 text-primary-foreground px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-up">
            <Sparkles className="h-4 w-4" />
            {texts.badge}
          </div>

          <h2
            className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4 animate-fade-up"
            style={{ animationDelay: "0.1s" }}
          >
            {texts.title}
          </h2>

          <p
            className="text-primary-foreground/70 text-lg mb-8 animate-fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            {texts.subtitle}
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto animate-fade-up"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="relative flex-1">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder={texts.placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 h-14 bg-background/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:border-primary"
                required
              />
            </div>
            <Button type="submit" variant="hero" size="xl">
              {texts.button}
            </Button>
          </form>

          <p
            className="text-primary-foreground/50 text-sm mt-4 animate-fade-up"
            style={{ animationDelay: "0.4s" }}
          >
            {texts.disclaimer}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;