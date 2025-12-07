import { Instagram, Facebook, Twitter, Youtube, MapPin, Phone, Mail } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const links = {
    shop: [
      { name: "Novidades", href: "#" },
      { name: "Best-sellers", href: "#" },
      { name: "Promoções", href: "#" },
      { name: "Kits Especiais", href: "#" },
      { name: "Vale Presente", href: "#" },
    ],
    categories: [
      { name: "Romance", href: "#" },
      { name: "Desenvolvimento", href: "#" },
      { name: "Ficção", href: "#" },
      { name: "Bem-estar", href: "#" },
      { name: "Clássicos", href: "#" },
    ],
    help: [
      { name: "Central de Ajuda", href: "#" },
      { name: "Rastrear Pedido", href: "#" },
      { name: "Trocas e Devoluções", href: "#" },
      { name: "Formas de Pagamento", href: "#" },
      { name: "Política de Privacidade", href: "#" },
    ],
  };

  const socials = [
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Youtube, href: "#", label: "Youtube" },
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="#" className="inline-block mb-4">
              <span className="font-serif text-2xl font-semibold text-foreground">
                Orbe <span className="text-primary">Livros</span>
              </span>
            </a>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Sua livraria online favorita. Curadoria especial de livros para
              mulheres que amam ler e se inspirar.
            </p>
            <div className="flex gap-3">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-serif font-semibold text-foreground mb-4">
              Loja
            </h4>
            <ul className="space-y-3">
              {links.shop.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-semibold text-foreground mb-4">
              Categorias
            </h4>
            <ul className="space-y-3">
              {links.categories.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-semibold text-foreground mb-4">
              Ajuda
            </h4>
            <ul className="space-y-3">
              {links.help.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-border mt-12 pt-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                São Paulo, Brasil
              </span>
              <span className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                (11) 99999-9999
              </span>
              <span className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                contato@orbelivros.com.br
              </span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © {currentYear} Orbe Livros. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
