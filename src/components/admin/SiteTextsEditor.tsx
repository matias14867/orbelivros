import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { toast } from "sonner";
import { Type, Home, Info, Mail, Gift, FileText, Loader2, Save, RotateCcw } from "lucide-react";

interface TextSection {
  key: string;
  label: string;
  fields: {
    name: string;
    label: string;
    type: "input" | "textarea";
    placeholder?: string;
  }[];
}

const TEXT_SECTIONS: TextSection[] = [
  {
    key: "hero",
    label: "Hero (Banner Principal)",
    fields: [
      { name: "badge", label: "Badge/Etiqueta", type: "input", placeholder: "Nova coleção disponível" },
      { name: "title", label: "Título Principal", type: "input", placeholder: "Descubra seu próximo" },
      { name: "titleHighlight", label: "Texto em Destaque", type: "input", placeholder: "livro favorito" },
      { name: "subtitle", label: "Subtítulo", type: "textarea", placeholder: "Explore nossa curadoria especial..." },
      { name: "buttonPrimary", label: "Botão Primário", type: "input", placeholder: "Explorar Livros" },
      { name: "buttonSecondary", label: "Botão Secundário", type: "input", placeholder: "Ver Ofertas" },
      { name: "stat1Value", label: "Estatística 1 - Valor", type: "input", placeholder: "5k+" },
      { name: "stat1Label", label: "Estatística 1 - Label", type: "input", placeholder: "Livros" },
      { name: "stat2Value", label: "Estatística 2 - Valor", type: "input", placeholder: "10k+" },
      { name: "stat2Label", label: "Estatística 2 - Label", type: "input", placeholder: "Clientes" },
      { name: "stat3Value", label: "Estatística 3 - Valor", type: "input", placeholder: "4.9" },
      { name: "stat3Label", label: "Estatística 3 - Label", type: "input", placeholder: "Avaliação" },
    ],
  },
  {
    key: "benefits",
    label: "Benefícios",
    fields: [
      { name: "sectionTag", label: "Tag da Seção", type: "input", placeholder: "Por que escolher a gente?" },
      { name: "sectionTitle", label: "Título da Seção", type: "input", placeholder: "Benefícios Exclusivos" },
      {
        name: "sectionSubtitle",
        label: "Subtítulo da Seção",
        type: "textarea",
        placeholder: "Oferecemos a melhor experiência...",
      },
      { name: "benefit1Title", label: "Benefício 1 - Título", type: "input", placeholder: "Frete Grátis" },
      {
        name: "benefit1Desc",
        label: "Benefício 1 - Descrição",
        type: "input",
        placeholder: "Em compras acima de R$ 99",
      },
      { name: "benefit2Title", label: "Benefício 2 - Título", type: "input", placeholder: "Compra Segura" },
      { name: "benefit2Desc", label: "Benefício 2 - Descrição", type: "input", placeholder: "Seus dados protegidos" },
      { name: "benefit3Title", label: "Benefício 3 - Título", type: "input", placeholder: "Parcele em 12x" },
      { name: "benefit3Desc", label: "Benefício 3 - Descrição", type: "input", placeholder: "Sem juros no cartão" },
      { name: "benefit4Title", label: "Benefício 4 - Título", type: "input", placeholder: "Embalagem Especial" },
      {
        name: "benefit4Desc",
        label: "Benefício 4 - Descrição",
        type: "input",
        placeholder: "Perfeita para presentear",
      },
      { name: "benefit5Title", label: "Benefício 5 - Título", type: "input", placeholder: "Entrega Rápida" },
      { name: "benefit5Desc", label: "Benefício 5 - Descrição", type: "input", placeholder: "Receba em até 7 dias" },
      { name: "benefit6Title", label: "Benefício 6 - Título", type: "input", placeholder: "Suporte 24h" },
      {
        name: "benefit6Desc",
        label: "Benefício 6 - Descrição",
        type: "input",
        placeholder: "Atendimento personalizado",
      },
    ],
  },
  {
    key: "newsletter",
    label: "Newsletter",
    fields: [
      { name: "badge", label: "Badge/Etiqueta", type: "input", placeholder: "Ofertas exclusivas" },
      { name: "title", label: "Título", type: "input", placeholder: "Receba 10% de desconto" },
      {
        name: "subtitle",
        label: "Subtítulo",
        type: "textarea",
        placeholder: "Assine nossa newsletter e ganhe desconto...",
      },
      { name: "placeholder", label: "Placeholder do Email", type: "input", placeholder: "Seu melhor e-mail" },
      { name: "button", label: "Texto do Botão", type: "input", placeholder: "Inscrever" },
      { name: "disclaimer", label: "Texto Legal", type: "input", placeholder: "Prometemos não enviar spam..." },
    ],
  },
  {
    key: "contact",
    label: "Página de Contato",
    fields: [
      { name: "badge", label: "Badge/Etiqueta", type: "input", placeholder: "Fale Conosco" },
      { name: "title", label: "Título", type: "input", placeholder: "Estamos aqui para ajudar" },
      { name: "subtitle", label: "Subtítulo", type: "textarea", placeholder: "Tem alguma dúvida, sugestão..." },
      { name: "formTitle", label: "Título do Formulário", type: "input", placeholder: "Envie sua mensagem" },
      {
        name: "formSubtitle",
        label: "Subtítulo do Formulário",
        type: "input",
        placeholder: "Preencha o formulário abaixo...",
      },
      { name: "emailLabel", label: "Label E-mail", type: "input", placeholder: "E-mail" },
      { name: "emailDesc", label: "Descrição E-mail", type: "input", placeholder: "Resposta em até 24h" },
      { name: "phoneLabel", label: "Label Telefone", type: "input", placeholder: "Telefone" },
      { name: "phoneDesc", label: "Descrição Telefone", type: "input", placeholder: "Seg a Sex, 9h às 18h" },
      { name: "addressLabel", label: "Label Endereço", type: "input", placeholder: "Endereço" },
    ],
  },
  {
    key: "about",
    label: "Quem Somos",
    fields: [
      { name: "badge", label: "Badge/Etiqueta", type: "input", placeholder: "Quem Somos" },
      { name: "title", label: "Título", type: "input", placeholder: "Sua Livraria de Confiança" },
      { name: "paragraph1", label: "Parágrafo 1", type: "textarea", placeholder: "Somos apaixonados por livros..." },
      { name: "paragraph2", label: "Parágrafo 2", type: "textarea", placeholder: "Cada livro em nossa curadoria..." },
      { name: "quote", label: "Citação Inspiradora", type: "textarea", placeholder: "Um livro é um sonho..." },
      { name: "quoteAuthor", label: "Autor da Citação", type: "input", placeholder: "Neil Gaiman" },
    ],
  },
  {
    key: "footer",
    label: "Rodapé",
    fields: [
      { name: "aboutTitle", label: "Título Sobre", type: "input", placeholder: "Sobre Nós" },
      { name: "aboutText", label: "Texto Sobre", type: "textarea", placeholder: "Sua livraria online favorita..." },
      { name: "linksTitle", label: "Título Links Rápidos", type: "input", placeholder: "Links Rápidos" },
      { name: "categoriesTitle", label: "Título Categorias", type: "input", placeholder: "Categorias" },
      { name: "contactTitle", label: "Título Contato", type: "input", placeholder: "Contato" },
      {
        name: "copyright",
        label: "Texto Copyright",
        type: "input",
        placeholder: "© 2024 Orbe Livros. Todos os direitos reservados.",
      },
    ],
  },
  {
    key: "header",
    label: "Cabeçalho",
    fields: [
      { name: "storeName", label: "Nome da Loja", type: "input", placeholder: "Orbe Livros" },
      { name: "menuHome", label: "Menu - Início", type: "input", placeholder: "Início" },
      { name: "menuBooks", label: "Menu - Todos os Livros", type: "input", placeholder: "Todos os Livros" },
      { name: "menuCategories", label: "Menu - Categorias", type: "input", placeholder: "Categorias" },
      { name: "menuBestsellers", label: "Menu - Destaques", type: "input", placeholder: "Destaques" },
      { name: "menuContact", label: "Menu - Contato", type: "input", placeholder: "Contato" },
    ],
  },
];

const DEFAULT_TEXTS: Record<string, Record<string, string>> = {
  hero: {
    badge: "Nova coleção disponível",
    title: "Descubra seu próximo",
    titleHighlight: "livro favorito",
    subtitle:
      "Explore nossa curadoria especial de livros selecionados para mulheres que amam ler. Romances, desenvolvimento pessoal, ficção e muito mais.",
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
    subtitle:
      "Assine nossa newsletter e ganhe desconto na primeira compra, além de receber novidades e recomendações de leitura.",
    placeholder: "Seu melhor e-mail",
    button: "Inscrever",
    disclaimer: "Prometemos não enviar spam. Você pode cancelar a qualquer momento.",
  },
  contact: {
    badge: "Fale Conosco",
    title: "Estamos aqui para ajudar",
    subtitle:
      "Tem alguma dúvida, sugestão ou precisa de suporte? Entre em contato conosco e responderemos o mais rápido possível.",
    formTitle: "Envie sua mensagem",
    formSubtitle: "Preencha o formulário abaixo e entraremos em contato",
    emailLabel: "E-mail",
    emailDesc: "Resposta em até 24h",
    phoneLabel: "Telefone",
    phoneDesc: "Seg a Sex, 9h às 18h",
    addressLabel: "Endereço",
  },
  footer: {
    aboutTitle: "Sobre Nós",
    aboutText: "Sua livraria online favorita, com curadoria especial de livros para mulheres que amam ler.",
    linksTitle: "Links Rápidos",
    categoriesTitle: "Categorias",
    contactTitle: "Contato",
    copyright: "© 2024 Orbe Livros. Todos os direitos reservados.",
  },
  about: {
    badge: "Quem Somos",
    title: "Orbe Livros",
    paragraph1:
      "Somos apaixonados por livros e acreditamos no poder transformador da leitura. Nossa missão é conectar leitoras a histórias que inspiram, emocionam e fazem refletir.",
    paragraph2:
      "Cada livro em nossa curadoria foi escolhido com carinho, pensando em você que busca momentos de paz, conhecimento e aventura entre as páginas.",
    quote: "Um livro é um sonho que você segura nas mãos.",
    quoteAuthor: "Neil Gaiman",
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

export function SiteTextsEditor() {
  const { settings, updateSetting, loading } = useSiteSettings();
  const [texts, setTexts] = useState<Record<string, Record<string, string>>>(DEFAULT_TEXTS);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    if (settings.texts) {
      setTexts((prev) => ({
        ...prev,
        ...settings.texts,
      }));
    }
  }, [settings]);

  const handleChange = (section: string, field: string, value: string) => {
    setTexts((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSetting("texts", texts);
      toast.success("Textos salvos com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar textos");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = (section: string) => {
    if (
      !confirm(
        `Tem certeza que deseja restaurar os textos padrão de "${TEXT_SECTIONS.find((s) => s.key === section)?.label}"?`,
      )
    )
      return;
    setTexts((prev) => ({
      ...prev,
      [section]: DEFAULT_TEXTS[section],
    }));
    toast.info("Textos restaurados. Clique em Salvar para aplicar.");
  };

  const getIcon = (key: string) => {
    switch (key) {
      case "hero":
        return <Home className="h-4 w-4" />;
      case "benefits":
        return <Gift className="h-4 w-4" />;
      case "newsletter":
        return <Mail className="h-4 w-4" />;
      case "contact":
        return <Info className="h-4 w-4" />;
      case "footer":
        return <FileText className="h-4 w-4" />;
      case "header":
        return <Type className="h-4 w-4" />;
      default:
        return <Type className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-xl font-semibold flex items-center gap-2">
            <Type className="h-5 w-5" />
            Editor de Textos do Site
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Edite todos os textos exibidos no site. As alterações são aplicadas em tempo real após salvar.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Salvar Todos
        </Button>
      </div>

      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <TabsList className="flex flex-wrap h-auto gap-2">
          {TEXT_SECTIONS.map((section) => (
            <TabsTrigger key={section.key} value={section.key} className="flex items-center gap-2">
              {getIcon(section.key)}
              <span className="hidden sm:inline">{section.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {TEXT_SECTIONS.map((section) => (
          <TabsContent key={section.key} value={section.key}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-serif flex items-center gap-2">
                    {getIcon(section.key)}
                    {section.label}
                  </CardTitle>
                  <CardDescription>Edite os textos desta seção do site</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleReset(section.key)}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restaurar Padrão
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {section.fields.map((field) => (
                    <div key={field.name} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
                      <Label htmlFor={`${section.key}-${field.name}`}>{field.label}</Label>
                      {field.type === "textarea" ? (
                        <Textarea
                          id={`${section.key}-${field.name}`}
                          value={texts[section.key]?.[field.name] || ""}
                          onChange={(e) => handleChange(section.key, field.name, e.target.value)}
                          placeholder={field.placeholder}
                          rows={3}
                          className="mt-1.5"
                        />
                      ) : (
                        <Input
                          id={`${section.key}-${field.name}`}
                          value={texts[section.key]?.[field.name] || ""}
                          onChange={(e) => handleChange(section.key, field.name, e.target.value)}
                          placeholder={field.placeholder}
                          className="mt-1.5"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
