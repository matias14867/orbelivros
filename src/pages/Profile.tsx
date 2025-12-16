import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { usePurchaseHistory } from "@/hooks/usePurchaseHistory";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Heart, ShoppingBag, User, Loader2, BookOpen, Trash2, AlertTriangle, Save, MapPin } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { favorites, loading: favLoading, removeFavorite } = useFavorites();
  const { purchases, loading: purchaseLoading } = usePurchaseHistory();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressStreet, setAddressStreet] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [addressComplement, setAddressComplement] = useState("");
  const [addressNeighborhood, setAddressNeighborhood] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressState, setAddressState] = useState("");
  const [addressZip, setAddressZip] = useState("");

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setAddressStreet(profile.address_street || "");
      setAddressNumber(profile.address_number || "");
      setAddressComplement(profile.address_complement || "");
      setAddressNeighborhood(profile.address_neighborhood || "");
      setAddressCity(profile.address_city || "");
      setAddressState(profile.address_state || "");
      setAddressZip(profile.address_zip || "");
    }
  }, [profile]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Você saiu da sua conta");
    navigate("/");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await updateProfile({
        full_name: fullName,
        phone,
        address_street: addressStreet,
        address_number: addressNumber,
        address_complement: addressComplement,
        address_neighborhood: addressNeighborhood,
        address_city: addressCity,
        address_state: addressState,
        address_zip: addressZip,
      });

      if (error) throw error;
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setDeleting(true);
    try {
      const { error } = await supabase.functions.invoke("delete-user-account", {
        body: { userId: user.id },
      });

      if (error) throw error;

      await signOut();
      toast.success("Sua conta foi excluída com sucesso");
      navigate("/");
    } catch (error) {
      toast.error("Erro ao excluir conta. Tente novamente.");
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const userInitials = user.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email?.slice(0, 2).toUpperCase();

  return (
    <>
      <Helmet>
        <title>Meu Perfil | Orbe Livros</title>
        <meta name="description" content="Gerencie seu perfil, favoritos e histórico de compras" />
      </Helmet>

      <Header />

      <main className="min-h-screen pt-24 pb-16">
        <div className="container max-w-4xl">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-serif">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left flex-1">
                  <h1 className="font-serif text-2xl font-bold text-foreground">
                    {profile?.full_name || user.user_metadata?.full_name || "Usuário"}
                  </h1>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" onClick={handleSignOut}>
                    Sair da conta
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir conta
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                          Excluir conta permanentemente?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Todos os seus dados serão
                          permanentemente removidos, incluindo favoritos e histórico de compras.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          disabled={deleting}
                        >
                          {deleting ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-2" />
                          )}
                          Excluir minha conta
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Meus Dados
              </TabsTrigger>
              <TabsTrigger value="favorites" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Favoritos ({favorites.length})
              </TabsTrigger>
              <TabsTrigger value="purchases" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Histórico ({purchases.length})
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-serif">
                    <User className="h-5 w-5 text-primary" />
                    Dados Pessoais
                  </CardTitle>
                  <CardDescription>
                    Atualize suas informações de contato e endereço de entrega
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {profileLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <form onSubmit={handleSaveProfile} className="space-y-6">
                      {/* Personal Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Nome completo</Label>
                          <Input
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Seu nome completo"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Telefone</Label>
                          <Input
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="(00) 00000-0000"
                          />
                        </div>
                      </div>

                      {/* Address Section */}
                      <div className="pt-4 border-t border-border">
                        <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          Endereço de Entrega
                        </h3>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="addressZip">CEP</Label>
                              <Input
                                id="addressZip"
                                value={addressZip}
                                onChange={(e) => setAddressZip(e.target.value)}
                                placeholder="00000-000"
                              />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                              <Label htmlFor="addressStreet">Rua</Label>
                              <Input
                                id="addressStreet"
                                value={addressStreet}
                                onChange={(e) => setAddressStreet(e.target.value)}
                                placeholder="Nome da rua"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="addressNumber">Número</Label>
                              <Input
                                id="addressNumber"
                                value={addressNumber}
                                onChange={(e) => setAddressNumber(e.target.value)}
                                placeholder="123"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="addressComplement">Complemento</Label>
                              <Input
                                id="addressComplement"
                                value={addressComplement}
                                onChange={(e) => setAddressComplement(e.target.value)}
                                placeholder="Apto, bloco"
                              />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                              <Label htmlFor="addressNeighborhood">Bairro</Label>
                              <Input
                                id="addressNeighborhood"
                                value={addressNeighborhood}
                                onChange={(e) => setAddressNeighborhood(e.target.value)}
                                placeholder="Seu bairro"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2 space-y-2">
                              <Label htmlFor="addressCity">Cidade</Label>
                              <Input
                                id="addressCity"
                                value={addressCity}
                                onChange={(e) => setAddressCity(e.target.value)}
                                placeholder="Sua cidade"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="addressState">UF</Label>
                              <Input
                                id="addressState"
                                value={addressState}
                                onChange={(e) => setAddressState(e.target.value.toUpperCase())}
                                placeholder="SP"
                                maxLength={2}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={saving}>
                          {saving ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Salvando...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Salvar Alterações
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Favorites Tab */}
            <TabsContent value="favorites">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-serif">
                    <Heart className="h-5 w-5 text-primary" />
                    Meus Favoritos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {favLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : favorites.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">
                        Você ainda não tem livros favoritos
                      </p>
                      <Button asChild>
                        <Link to="/livros">Explorar Livros</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {favorites.map((fav) => (
                        <div
                          key={fav.id}
                          className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg"
                        >
                          {fav.product_image ? (
                            <img
                              src={fav.product_image}
                              alt={fav.product_title}
                              className="w-16 h-20 object-cover rounded"
                            />
                          ) : (
                            <div className="w-16 h-20 bg-muted rounded flex items-center justify-center">
                              <BookOpen className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <Link
                              to={`/produto/${fav.product_handle}`}
                              className="font-medium text-foreground hover:text-primary transition-colors truncate block"
                            >
                              {fav.product_title}
                            </Link>
                            {fav.product_price && (
                              <p className="text-sm text-primary font-semibold">
                                R$ {Number(fav.product_price).toFixed(2).replace(".", ",")}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFavorite(fav.product_handle)}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Purchase History Tab */}
            <TabsContent value="purchases">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-serif">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    Histórico de Compras
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {purchaseLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : purchases.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">
                        Você ainda não fez nenhuma compra
                      </p>
                      <Button asChild>
                        <Link to="/livros">Começar a Comprar</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {purchases.map((purchase) => (
                        <div
                          key={purchase.id}
                          className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg"
                        >
                          {purchase.product_image ? (
                            <img
                              src={purchase.product_image}
                              alt={purchase.product_title}
                              className="w-16 h-20 object-cover rounded"
                            />
                          ) : (
                            <div className="w-16 h-20 bg-muted rounded flex items-center justify-center">
                              <BookOpen className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <Link
                              to={`/produto/${purchase.product_handle}`}
                              className="font-medium text-foreground hover:text-primary transition-colors truncate block"
                            >
                              {purchase.product_title}
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              Quantidade: {purchase.quantity}
                            </p>
                            <p className="text-sm text-primary font-semibold">
                              R$ {Number(purchase.product_price).toFixed(2).replace(".", ",")}
                            </p>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            {new Date(purchase.purchased_at).toLocaleDateString("pt-BR")}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Profile;
