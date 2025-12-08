import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ShieldCheck, CreditCard, RefreshCw } from "lucide-react";

const policies = {
  privacidade: {
    title: "Política de Privacidade",
    icon: ShieldCheck,
    content: `
## 1. Informações que Coletamos

A Orbe Livros coleta informações que você nos fornece diretamente, como:
- Nome completo
- Endereço de e-mail
- Informações de entrega
- Histórico de compras

## 2. Como Usamos Suas Informações

Utilizamos suas informações para:
- Processar e entregar seus pedidos
- Enviar atualizações sobre seus pedidos
- Melhorar nossos serviços
- Personalizar sua experiência de compra

## 3. Proteção de Dados

Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição.

## 4. Seus Direitos

De acordo com a LGPD, você tem direito a:
- Acessar seus dados pessoais
- Corrigir dados incompletos ou desatualizados
- Solicitar a exclusão de seus dados
- Revogar o consentimento

## 5. Contato

Para questões sobre privacidade, entre em contato conosco pelo e-mail: privacidade@orbelivros.com.br
    `,
  },
  termos: {
    title: "Termos de Uso",
    icon: FileText,
    content: `
## 1. Aceitação dos Termos

Ao acessar e usar o site Orbe Livros, você concorda com estes termos de uso.

## 2. Uso do Site

Você concorda em usar o site apenas para fins legais e de maneira que não infrinja os direitos de terceiros.

## 3. Conta do Usuário

Ao criar uma conta, você é responsável por manter a confidencialidade de suas credenciais de acesso.

## 4. Propriedade Intelectual

Todo o conteúdo do site, incluindo textos, imagens e logotipos, é propriedade da Orbe Livros e protegido por leis de direitos autorais.

## 5. Limitação de Responsabilidade

A Orbe Livros não se responsabiliza por danos indiretos decorrentes do uso do site.

## 6. Alterações nos Termos

Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entram em vigor imediatamente após a publicação.
    `,
  },
  pagamento: {
    title: "Formas de Pagamento",
    icon: CreditCard,
    content: `
## Cartão de Crédito

Aceitamos as principais bandeiras:
- Visa
- Mastercard
- American Express
- Elo

Parcelamento em até 12x sem juros para compras acima de R$ 100,00.

## Cartão de Débito

Pagamento à vista com débito nas bandeiras Visa e Mastercard.

## PIX

Pagamento instantâneo com desconto de 5% no valor total do pedido.

## Boleto Bancário

Prazo de compensação de até 3 dias úteis. O pedido será processado após confirmação do pagamento.

## Segurança

Todas as transações são criptografadas e processadas em ambiente seguro. Não armazenamos dados completos de cartão de crédito.
    `,
  },
  trocas: {
    title: "Trocas e Devoluções",
    icon: RefreshCw,
    content: `
## Prazo para Troca ou Devolução

Você tem até 7 dias corridos após o recebimento do produto para solicitar troca ou devolução.

## Condições para Troca

O produto deve estar:
- Em sua embalagem original
- Sem sinais de uso ou danos
- Com todos os acessórios e brindes que acompanham

## Como Solicitar

1. Entre em contato pelo nosso formulário de contato
2. Informe o número do pedido e motivo da troca
3. Aguarde as instruções de envio

## Reembolso

O reembolso será processado em até 10 dias úteis após recebermos o produto devolvido, utilizando a mesma forma de pagamento original.

## Produtos com Defeito

Para produtos com defeito de fabricação, a troca ou reembolso será realizada sem custos adicionais.

## Custos de Envio

- Troca por defeito: frete por nossa conta
- Desistência/arrependimento: frete por conta do cliente
    `,
  },
};

const Policies = () => {
  const { policy } = useParams<{ policy: string }>();
  const policyData = policies[policy as keyof typeof policies];

  if (!policyData) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 pb-16">
          <div className="container text-center">
            <h1 className="font-serif text-3xl font-bold text-foreground mb-4">
              Página não encontrada
            </h1>
            <p className="text-muted-foreground">
              A política solicitada não existe.
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const Icon = policyData.icon;

  return (
    <>
      <Helmet>
        <title>{policyData.title} | Orbe Livros</title>
        <meta name="description" content={`${policyData.title} da Orbe Livros`} />
      </Helmet>

      <Header />

      <main className="min-h-screen pt-24 pb-16">
        <div className="container max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-2xl md:text-3xl flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                {policyData.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm md:prose max-w-none text-muted-foreground">
                {policyData.content.split('\n').map((line, index) => {
                  if (line.startsWith('## ')) {
                    return (
                      <h2 key={index} className="font-serif text-xl font-semibold text-foreground mt-6 mb-3">
                        {line.replace('## ', '')}
                      </h2>
                    );
                  }
                  if (line.startsWith('- ')) {
                    return (
                      <li key={index} className="ml-4">
                        {line.replace('- ', '')}
                      </li>
                    );
                  }
                  if (line.trim()) {
                    return <p key={index} className="mb-2">{line}</p>;
                  }
                  return null;
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Policies;
