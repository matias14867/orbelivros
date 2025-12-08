import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { usePurchaseHistory } from "@/hooks/usePurchaseHistory";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Heart, ShoppingBag, User, Loader2, BookOpen, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { favorites, loading: favLoading, removeFavorite } = useFavorites();
  const { purchases, loading: purchaseLoading } = usePurchaseHistory();
  const [deleting, setDeleting] = useState(false);

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

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setDeleting(true);
    try {
      // Delete user's data from all tables
      await supabase.from('favorites').delete().eq('user_id', user.id);
      await supabase.from('purchase_history').delete().eq('user_id', user.id);
      await supabase.from('user_roles').delete().eq('user_id', user.id);
      await supabase.from('profiles').delete().eq('user_id', user.id);
      
      // Sign out the user
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
                    {user.user_metadata?.full_name || "Usuário"}
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
          <Tabs defaultValue="favorites" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="favorites" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Favoritos ({favorites.length})
              </TabsTrigger>
              <TabsTrigger value="purchases" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Histórico ({purchases.length})
              </TabsTrigger>
            </TabsList>

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
