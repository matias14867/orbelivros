import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useAllProducts, useDeleteProduct, useUpdateProduct, Product } from "@/hooks/useProducts";
import { useContacts } from "@/hooks/useContacts";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { SiteTextsEditor } from "@/components/admin/SiteTextsEditor";
import { SiteImagesEditor } from "@/components/admin/SiteImagesEditor";
import {
  Loader2,
  Package,
  Edit,
  Shield,
  Search,
  Users,
  MessageSquare,
  Palette,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle,
  Clock,
  User,
  Mail,
  Phone,
  Type,
  Image as ImageIcon,
  Download,
} from "lucide-react";
import { toast } from "sonner";

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { data: products, isLoading: productsLoading, refetch: refetchProducts } = useAllProducts();
  const deleteProduct = useDeleteProduct();
  const updateProduct = useUpdateProduct();
  const { contacts, loading: contactsLoading, updateContactStatus, deleteContact, refetch: refetchContacts } = useContacts();
  const { users, loading: usersLoading, deleteUser, refetch: refetchUsers } = useAdminUsers();
  const { settings, updateSetting } = useSiteSettings();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [importKeyword, setImportKeyword] = useState("");
  const [importing, setImporting] = useState(false);

  const [siteSettings, setSiteSettings] = useState({
    primaryColor: "#d4a5a5",
    storeName: "Dropshipping Store",
    heroTitle: "Produtos incríveis com os melhores preços",
    heroSubtitle: "Entrega rápida para todo o Brasil",
  });

  const [contactInfo, setContactInfo] = useState({
    phone: "(11) 99999-9999",
    email: "contato@loja.com.br",
    address: "São Paulo, Brasil",
    instagram: "",
    facebook: "",
    twitter: "",
    youtube: "",
  });

  useEffect(() => {
    if (settings.contact) {
      setContactInfo({
        phone: settings.contact.phone || "(11) 99999-9999",
        email: settings.contact.email || "contato@loja.com.br",
        address: settings.contact.address || "São Paulo, Brasil",
        instagram: settings.contact.instagram || "",
        facebook: settings.contact.facebook || "",
        twitter: settings.contact.twitter || "",
        youtube: settings.contact.youtube || "",
      });
    }
    if (settings.theme) {
      setSiteSettings({
        primaryColor: settings.theme.primaryColor || "#d4a5a5",
        storeName: settings.theme.storeName || "Dropshipping Store",
        heroTitle: settings.theme.heroTitle || "Produtos incríveis com os melhores preços",
        heroSubtitle: settings.theme.heroSubtitle || "Entrega rápida para todo o Brasil",
      });
    }
  }, [settings]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (!authLoading && !roleLoading && !isAdmin) {
      toast.error("Acesso negado. Apenas administradores.");
      navigate("/");
      return;
    }
  }, [user, authLoading, isAdmin, roleLoading, navigate]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase();
    return products.filter((p) =>
      p.title.toLowerCase().includes(query) ||
      p.category?.toLowerCase().includes(query)
    );
  }, [searchQuery, products]);

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`Excluir "${product.title}"?`)) return;
    try {
      await deleteProduct.mutateAsync(product.id);
      toast.success("Produto excluído!");
    } catch (error) {
      toast.error("Erro ao excluir");
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Excluir usuário "${userName}"?`)) return;
    try {
      await deleteUser(userId);
      toast.success("Usuário excluído!");
    } catch (error) {
      toast.error("Erro ao excluir usuário");
    }
  };

  const handleContactStatus = async (id: string, status: string) => {
    try {
      await updateContactStatus(id, status);
      toast.success("Status atualizado!");
    } catch (error) {
      toast.error("Erro ao atualizar status");
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm("Excluir contato?")) return;
    try {
      await deleteContact(id);
      toast.success("Contato excluído!");
    } catch (error) {
      toast.error("Erro ao excluir contato");
    }
  };

  const handleSaveSettings = async () => {
    try {
      await updateSetting("theme", siteSettings);
      toast.success("Configurações salvas!");
    } catch (error) {
      toast.error("Erro ao salvar");
    }
  };

  const handleSaveContactInfo = async () => {
    try {
      await updateSetting("contact", contactInfo);
      toast.success("Contato salvo!");
    } catch (error) {
      toast.error("Erro ao salvar");
    }
  };

  const handleImportProducts = async () => {
    if (!importKeyword.trim()) {
      toast.error("Digite uma palavra-chave");
      return;
    }
    
    setImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('cj-api', {
        body: { action: 'searchProducts', keyword: importKeyword, pageSize: 10 },
      });

      if (error) throw error;
      
      if (data?.data?.list) {
        for (const product of data.data.list) {
          await supabase.functions.invoke('cj-api', {
            body: { action: 'importProduct', product, markup: 2.5 },
          });
        }
        toast.success(`${data.data.list.length} produtos importados!`);
        refetchProducts();
      } else {
        toast.error("Nenhum produto encontrado");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao importar");
    } finally {
      setImporting(false);
    }
  };

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <>
      <Helmet>
        <title>Admin | Dropshipping Store</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <Header />

      <main className="min-h-screen pt-24 pb-16">
        <div className="container">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-3xl font-bold">Painel Admin</h1>
              <p className="text-muted-foreground">Gerencie sua loja dropshipping</p>
            </div>
          </div>

          <Tabs defaultValue="products" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
              <TabsTrigger value="products" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Produtos</span>
              </TabsTrigger>
              <TabsTrigger value="contacts" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Contatos</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Usuários</span>
              </TabsTrigger>
              <TabsTrigger value="texts" className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                <span className="hidden sm:inline">Textos</span>
              </TabsTrigger>
              <TabsTrigger value="images" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Imagens</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Estilo</span>
              </TabsTrigger>
            </TabsList>

            {/* Products Tab */}
            <TabsContent value="products" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Importar do CJ Dropshipping
                  </CardTitle>
                  <CardDescription>
                    Busque e importe produtos automaticamente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Input
                      placeholder="Ex: smartphone, headphone, watch..."
                      value={importKeyword}
                      onChange={(e) => setImportKeyword(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleImportProducts} disabled={importing}>
                      {importing ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Importar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar produtos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" onClick={() => refetchProducts()}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              {productsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum produto</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map((product) => (
                    <Card key={product.id}>
                      <CardContent className="pt-4">
                        <div className="flex gap-3">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.title}
                              className="w-16 h-16 object-cover rounded"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{product.title}</p>
                            <p className="text-sm text-muted-foreground">{product.category}</p>
                            <p className="text-sm font-bold text-primary">
                              R$ {product.price.toFixed(2)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteProduct(product)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Contacts Tab */}
            <TabsContent value="contacts" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Mensagens de Contato</h2>
                <Button variant="outline" onClick={refetchContacts}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              {contactsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : contacts.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhuma mensagem</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {contacts.map((contact) => (
                    <Card key={contact.id}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <p className="font-medium">{contact.name}</p>
                              <Badge variant={contact.status === 'resolved' ? 'default' : 'secondary'}>
                                {contact.status === 'resolved' ? 'Resolvido' : 'Pendente'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{contact.email}</p>
                            <p className="text-sm font-medium mt-2">{contact.subject}</p>
                            <p className="text-sm text-muted-foreground mt-1">{contact.message}</p>
                          </div>
                          <div className="flex gap-2">
                            {contact.status !== 'resolved' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleContactStatus(contact.id, 'resolved')}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteContact(contact.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Usuários</h2>
                <Button variant="outline" onClick={refetchUsers}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              {usersLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : users.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum usuário</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {users.map((user) => (
                    <Card key={user.user_id}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{user.full_name || 'Sem nome'}</p>
                              <p className="text-sm text-muted-foreground">{user.user_id}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.user_id, user.full_name || 'usuário')}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Texts Tab */}
            <TabsContent value="texts">
              <SiteTextsEditor />
            </TabsContent>

            {/* Images Tab */}
            <TabsContent value="images">
              <SiteImagesEditor />
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Aparência</CardTitle>
                  <CardDescription>Personalize a aparência da loja</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div>
                      <Label>Nome da Loja</Label>
                      <Input
                        value={siteSettings.storeName}
                        onChange={(e) => setSiteSettings({ ...siteSettings, storeName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Título do Hero</Label>
                      <Input
                        value={siteSettings.heroTitle}
                        onChange={(e) => setSiteSettings({ ...siteSettings, heroTitle: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Subtítulo do Hero</Label>
                      <Input
                        value={siteSettings.heroSubtitle}
                        onChange={(e) => setSiteSettings({ ...siteSettings, heroSubtitle: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button onClick={handleSaveSettings}>Salvar Aparência</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Informações de Contato</CardTitle>
                  <CardDescription>Dados exibidos no rodapé</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div>
                      <Label>Telefone</Label>
                      <Input
                        value={contactInfo.phone}
                        onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        value={contactInfo.email}
                        onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Endereço</Label>
                      <Input
                        value={contactInfo.address}
                        onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button onClick={handleSaveContactInfo}>Salvar Contato</Button>
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

export default Admin;