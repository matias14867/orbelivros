import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useSubscriberRole } from "@/hooks/useSubscriberRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CreditCard, Users, FileText, Settings, DollarSign, Send } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const Subscribers = () => {
  const { user, loading: authLoading } = useAuth();
  const { hasAccess, isAdmin, loading: roleLoading } = useSubscriberRole();
  const navigate = useNavigate();

  const [chargeAmount, setChargeAmount] = useState("");
  const [chargeDescription, setChargeDescription] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!roleLoading && user && !hasAccess) {
      toast.error("Acesso restrito a assinantes");
      navigate("/");
    }
  }, [hasAccess, roleLoading, user, navigate]);

  const handleGenerateCharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chargeAmount || !customerEmail) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    // Simulação de geração de cobrança
    toast.success("Cobrança gerada com sucesso!", {
      description: `Cobrança de R$ ${chargeAmount} enviada para ${customerEmail}`,
    });
    setChargeAmount("");
    setChargeDescription("");
    setCustomerEmail("");
  };

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !hasAccess) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Painel de Assinantes | Orbe Livros</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <Header />

      <main className="min-h-screen bg-muted/30 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Painel de Assinantes
            </h1>
            <p className="text-muted-foreground mt-2">
              {isAdmin ? "Acesso completo (Admin)" : "Bem-vindo(a) ao seu painel exclusivo"}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">R$ 0,00</p>
                    <p className="text-sm text-muted-foreground">Cobranças do mês</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <CreditCard className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground">Cobranças pagas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <FileText className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground">Cobranças pendentes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground">Clientes ativos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Gerar Cobrança */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Gerar Nova Cobrança
                </CardTitle>
                <CardDescription>
                  Crie uma cobrança e envie para o email do cliente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerateCharge} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">Email do Cliente *</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      placeholder="cliente@email.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chargeAmount">Valor (R$) *</Label>
                    <Input
                      id="chargeAmount"
                      type="number"
                      placeholder="0,00"
                      min="0"
                      step="0.01"
                      value={chargeAmount}
                      onChange={(e) => setChargeAmount(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chargeDescription">Descrição</Label>
                    <Textarea
                      id="chargeDescription"
                      placeholder="Descrição da cobrança..."
                      value={chargeDescription}
                      onChange={(e) => setChargeDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Gerar Cobrança
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Configurações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações
                </CardTitle>
                <CardDescription>
                  Gerencie suas preferências de cobrança
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Status da Assinatura</h4>
                  <p className="text-sm text-muted-foreground">
                    Sua assinatura está <span className="text-green-600 font-medium">ativa</span>
                  </p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Métodos de Pagamento</h4>
                  <p className="text-sm text-muted-foreground">
                    Nenhum método configurado
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Adicionar Método
                  </Button>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Notificações</h4>
                  <p className="text-sm text-muted-foreground">
                    Receba alertas sobre suas cobranças
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Configurar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Histórico de Cobranças */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Histórico de Cobranças
              </CardTitle>
              <CardDescription>
                Visualize todas as suas cobranças geradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma cobrança gerada ainda</p>
                <p className="text-sm">Suas cobranças aparecerão aqui</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Subscribers;
