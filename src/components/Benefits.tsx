import { Truck, Shield, CreditCard, Gift, Clock, Headphones } from "lucide-react";
import { useSiteTexts } from "@/hooks/useSiteTexts";

const Benefits = () => {
  const { getSection } = useSiteTexts();
  const texts = getSection("benefits");

  const benefits = [
    {
      icon: Truck,
      title: texts.benefit1Title,
      description: texts.benefit1Desc,
    },
    {
      icon: Shield,
      title: texts.benefit2Title,
      description: texts.benefit2Desc,
    },
    {
      icon: CreditCard,
      title: texts.benefit3Title,
      description: texts.benefit3Desc,
    },
    {
      icon: Gift,
      title: texts.benefit4Title,
      description: texts.benefit4Desc,
    },
    {
      icon: Clock,
      title: texts.benefit5Title,
      description: texts.benefit5Desc,
    },
    {
      icon: Headphones,
      title: texts.benefit6Title,
      description: texts.benefit6Desc,
    },
  ];

  return (
    <section id="beneficios" className="py-20 md:py-28 bg-rose-light/50">
      <div className="container">
        <div className="text-center mb-14">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            {texts.sectionTag}
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-2 mb-4">
            {texts.sectionTitle}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {texts.sectionSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className="flex items-start gap-4 p-6 bg-card rounded-2xl shadow-card hover-lift animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <benefit.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-serif font-semibold text-foreground text-lg mb-1">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
