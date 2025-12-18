import { useSiteSettings } from './useSiteSettings';

const DEFAULT_TEXTS: Record<string, Record<string, string>> = {
  hero: {
    badge: "Nova coleção disponível",
    title: "Descubra seu próximo",
    titleHighlight: "livro favorito",
    subtitle: "Explore nossa curadoria especial de livros selecionados para mulheres que amam ler. Romances, desenvolvimento pessoal, ficção e muito mais.",
    buttonPrimary: "Explorar Livros",
    buttonSecondary: "Ver Ofertas",
    stat1Value: "5k+",
    stat1Label: "Livros",
    stat2Value: "10k+",
    stat2Label: "Clientes",
    stat3Value: "4.9",
    stat3Label: "Avaliação",
  },
  benefits: {
    sectionTag: "Por que escolher a gente?",
    sectionTitle: "Benefícios Exclusivos",
    sectionSubtitle: "Oferecemos a melhor experiência de compra para você aproveitar cada página",
    benefit1Title: "Frete Grátis",
    benefit1Desc: "Em compras acima de R$ 99 para todo o Brasil",
    benefit2Title: "Compra Segura",
    benefit2Desc: "Seus dados protegidos com criptografia",
    benefit3Title: "Parcele em 12x",
    benefit3Desc: "Sem juros no cartão de crédito",
    benefit4Title: "Embalagem Especial",
    benefit4Desc: "Perfeita para presentear quem você ama",
    benefit5Title: "Entrega Rápida",
    benefit5Desc: "Receba em até 7 dias úteis",
    benefit6Title: "Suporte 24h",
    benefit6Desc: "Atendimento personalizado sempre",
  },
  newsletter: {
    badge: "Ofertas exclusivas",
    title: "Receba 10% de desconto",
    subtitle: "Assine nossa newsletter e ganhe desconto na primeira compra, além de receber novidades e recomendações de leitura.",
    placeholder: "Seu melhor e-mail",
    button: "Inscrever",
    disclaimer: "Prometemos não enviar spam. Você pode cancelar a qualquer momento.",
  },
  contact: {
    badge: "Fale Conosco",
    title: "Estamos aqui para ajudar",
    subtitle: "Tem alguma dúvida, sugestão ou precisa de suporte? Entre em contato conosco e responderemos o mais rápido possível.",
    formTitle: "Envie sua mensagem",
    formSubtitle: "Preencha o formulário abaixo e entraremos em contato",
    emailLabel: "E-mail",
    emailDesc: "Resposta em até 24h",
    phoneLabel: "Telefone",
    phoneDesc: "Seg a Sex, 9h às 18h",
    addressLabel: "Endereço",
  },
  about: {
    badge: "Quem Somos",
    title: "Sua Livraria de Confiança",
    paragraph1: "Somos apaixonados por livros e acreditamos no poder transformador da leitura. Nossa missão é conectar leitoras a histórias que inspiram, emocionam e fazem refletir.",
    paragraph2: "Cada livro em nossa curadoria foi escolhido com carinho, pensando em você que busca momentos de paz, conhecimento e aventura entre as páginas.",
    quote: "Um livro é um sonho que você segura nas mãos.",
    quoteAuthor: "Neil Gaiman",
  },
  footer: {
    aboutTitle: "Sobre Nós",
    aboutText: "Sua livraria online favorita, com curadoria especial de livros para mulheres que amam ler.",
    linksTitle: "Links Rápidos",
    categoriesTitle: "Categorias",
    contactTitle: "Contato",
    copyright: "© 2024 Orbe Livros. Todos os direitos reservados.",
  },
  header: {
    storeName: "Orbe Livros",
    menuHome: "Início",
    menuBooks: "Todos os Livros",
    menuCategories: "Categorias",
    menuBestsellers: "Destaques",
    menuContact: "Contato",
  },
};

export function useSiteTexts() {
  const { settings, loading } = useSiteSettings();
  
  const getText = (section: string, key: string): string => {
    const texts = settings.texts as Record<string, Record<string, string>> | undefined;
    return texts?.[section]?.[key] || DEFAULT_TEXTS[section]?.[key] || "";
  };

  const getSection = (section: string): Record<string, string> => {
    const texts = settings.texts as Record<string, Record<string, string>> | undefined;
    return {
      ...DEFAULT_TEXTS[section],
      ...texts?.[section],
    };
  };

  return {
    getText,
    getSection,
    loading,
  };
}
