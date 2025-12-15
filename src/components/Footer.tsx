import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter, Youtube, MapPin, Phone, Mail } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { settings } = useSiteSettings();

  const contactInfo = settings.contact || {};
  const phone = contactInfo.phone || "(11) 99999-9999";
  const email = contactInfo.email || "contato@orbelivros.com.br";
  const address = contactInfo.address || "São Paulo, Brasil";

  const links = {
    shop: [
      { name: "Novidades", href: "/livros" },
      { name: "Best-sellers", href: "/destaques" },
      { name: "Todos os Livros", href: "/livros" },
      { name: "Contato", href: "/contato" },
    ],
    categories: [
      { name: "Romance", href: "/livros?categoria=Romance" },
      { name: "Autoajuda", href: "/livros?categoria=Autoajuda" },
      { name: "Ficção", href: "/livros?categoria=Ficção" },
      { name: "Fantasia", href: "/livros?categoria=Fantasia" },
      { name: "Clássicos", href: "/livros?categoria=Clássicos" },
    ],
    help: [
      { name: "Central de Ajuda", href: "/contato" },
      { name: "Trocas e Devoluções", href: "/politicas/trocas" },
      { name: "Formas de Pagamento", href: "/politicas/pagamento" },
      { name: "Política de Privacidade", href: "/politicas/privacidade" },
      { name: "Termos de Uso", href: "/politicas/termos" },
    ],
  };

  const socials = [
    { icon: Instagram, href: contactInfo.instagram || "#", label: "Instagram", enabled: !!contactInfo.instagram },
    { icon: Facebook, href: contactInfo.facebook || "#", label: "Facebook", enabled: !!contactInfo.facebook },
    { icon: Twitter, href: contactInfo.twitter || "#", label: "Twitter", enabled: !!contactInfo.twitter },
    { icon: Youtube, href: contactInfo.youtube || "#", label: "Youtube", enabled: !!contactInfo.youtube },
  ];

  // Show all icons if none configured, otherwise only show configured ones
  const hasAnySocial = socials.some(s => s.enabled);
  const displayedSocials = hasAnySocial ? socials.filter(s => s.enabled) : socials;

  return (
    <footer className="bg-card border-t border-border">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <span className="font-serif text-2xl font-semibold text-foreground">
                Orbe <span className="text-primary">Livros</span>
              </span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Sua livraria online favorita. Curadoria especial de livros para
              mulheres que amam ler e se inspirar.
            </p>
            <div className="flex gap-3">
              {displayedSocials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
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
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
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
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
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
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
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
                {address}
              </span>
              <a href={`tel:${phone.replace(/\D/g, '')}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                <Phone className="h-4 w-4 text-primary" />
                {phone}
              </a>
              <a href={`mailto:${email}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                <Mail className="h-4 w-4 text-primary" />
                {email}
              </a>
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
