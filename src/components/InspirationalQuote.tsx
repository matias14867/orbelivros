import { Quote } from "lucide-react";

interface InspirationalQuoteProps {
  quote: string;
  author: string;
  className?: string;
}

const FAMOUS_QUOTES = [
  {
    quote: "Um livro é um sonho que você segura nas mãos.",
    author: "Neil Gaiman"
  },
  {
    quote: "A leitura é uma conversa com os homens mais ilustres dos séculos passados.",
    author: "René Descartes"
  },
  {
    quote: "Os livros são os mais silenciosos e constantes amigos.",
    author: "Charles W. Eliot"
  },
  {
    quote: "Ler é sonhar pela mão de outrem.",
    author: "Fernando Pessoa"
  },
  {
    quote: "A literatura é a maneira mais agradável de ignorar a vida.",
    author: "Fernando Pessoa"
  },
  {
    quote: "Escrever é perpetuar-se.",
    author: "Clarice Lispector"
  },
  {
    quote: "A liberdade de ler é essencial para a democracia.",
    author: "Virginia Woolf"
  },
  {
    quote: "Você não pode abrir um livro sem aprender algo.",
    author: "Confúcio"
  }
];

export const getRandomQuote = () => {
  return FAMOUS_QUOTES[Math.floor(Math.random() * FAMOUS_QUOTES.length)];
};

const InspirationalQuote = ({ quote, author, className = "" }: InspirationalQuoteProps) => {
  return (
    <div className={`text-center py-12 px-6 ${className}`}>
      <Quote className="h-8 w-8 text-primary/40 mx-auto mb-4" />
      <blockquote className="font-serif text-xl md:text-2xl text-foreground/80 italic max-w-3xl mx-auto mb-4">
        "{quote}"
      </blockquote>
      <cite className="text-muted-foreground not-italic">— {author}</cite>
    </div>
  );
};

export default InspirationalQuote;
