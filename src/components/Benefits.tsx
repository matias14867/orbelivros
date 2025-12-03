import { Truck, Shield, CreditCard, Gift, Clock, Headphones } from "lucide-react";

const benefits = [
  {
    icon: Truck,
    title: "Frete Grátis",
    description: "Em compras acima de R$ 99 para todo o Brasil",
  },
  {
    icon: Shield,
    title: "Compra Segura",
    description: "Seus dados protegidos com criptografia",
  },
  {
    icon: CreditCard,
    title: "Parcele em 12x",
    description: "Sem juros no cartão de crédito",
  },
  {
    icon: Gift,
    title: "Embalagem Especial",
    description: "Perfeita para presentear quem você ama",
  },
  {
    icon: Clock,
    title: "Entrega Rápida",
    description: "Receba em até 7 dias úteis",
  },
  {
    icon: Headphones,
    title: "Suporte 24h",
    description: "Atendimento personalizado sempre",
  },
];

const Benefits = () => {
  return (
    <section id="beneficios" className="py-20 md:py-28 bg-rose-light/50">
      <div className="container">
        <div className="text-center mb-14">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Por que escolher a gente?
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-2 mb-4">
            Benefícios Exclusivos
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Oferecemos a melhor experiência de compra para você aproveitar cada
            página
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
