import { useEffect, useState, useMemo, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useBooks, Book } from "@/hooks/useBooks";
import { useContacts } from "@/hooks/useContacts";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { SiteTextsEditor } from "@/components/admin/SiteTextsEditor";
import { SiteImagesEditor } from "@/components/admin/SiteImagesEditor";
import CommentsManager from "@/components/admin/CommentsManager";
import PromotionsManager from "@/components/admin/PromotionsManager";
import {
  Loader2,
  BookOpen,
  Edit,
  Shield,
  Search,
  Users,
  MessageSquare,
  MessageCircle,
  Palette,
  Tag,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle,
  Clock,
  User,
  Mail,
  TestTube,
  Phone,
  Type,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  "Romance",
  "Autoajuda",
  "Ficção",
  "Poesia",
  "Clássicos",
  "Drama",
  "Fantasia",
  "Distopia",
  "Literatura Brasileira",
  "Infantojuvenil",
  "Tragédia",
];

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { books, loading: booksLoading, addBook, updateBook, deleteBook, refetch: refetchBooks } = useBooks();
  const { contacts, loading: contactsLoading, updateContactStatus, deleteContact, refetch: refetchContacts } = useContacts();
  const { users, loading: usersLoading, deleteUser, refetch: refetchUsers } = useAdminUsers();
  const { settings, updateSetting } = useSiteSettings();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    author: "",
    description: "",
    price: "",
    original_price: "",
    category: "",
    image_url: "",
    handle: "",
    in_stock: true,
    featured: false,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Site settings state
  const [siteSettings, setSiteSettings] = useState({
    primaryColor: "#d4a5a5",
    storeName: "Orbe Livros",
    heroTitle: "Descubra seu próximo livro favorito",
    heroSubtitle: "Curadoria especial para mulheres que amam ler",
  });

  // Contact info state
  const [contactInfo, setContactInfo] = useState({
    phone: "(11) 99999-9999",
    email: "contato@orbelivros.com.br",
    address: "São Paulo, Brasil",
    instagram: "",
    facebook: "",
    twitter: "",
    youtube: "",
  });

  // Load settings from database
  useEffect(() => {
    if (settings.contact) {
      setContactInfo({
        phone: settings.contact.phone || "(11) 99999-9999",
        email: settings.contact.email || "contato@orbelivros.com.br",
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
        storeName: settings.theme.storeName || "Orbe Livros",
        heroTitle: settings.theme.heroTitle || "Descubra seu próximo livro favorito",
        heroSubtitle: settings.theme.heroSubtitle || "Curadoria especial para mulheres que amam ler",
      });
    }
  }, [settings]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (!authLoading && !roleLoading && !isAdmin) {
      toast.error("Acesso negado. Apenas administradores podem acessar esta página.");
      navigate("/");
      return;
    }
  }, [user, authLoading, isAdmin, roleLoading, navigate]);

  const filteredBooks = useMemo(() => {
    if (!searchQuery.trim()) return books;
    const query = searchQuery.toLowerCase();
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(query) ||
        b.author?.toLowerCase().includes(query)
    );
  }, [searchQuery, books]);

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setIsCreating(false);
    setEditForm({
      title: book.title,
      author: book.author || "",
      description: book.description || "",
      price: String(book.price),
      original_price: book.original_price ? String(book.original_price) : "",
      category: book.category || "",
      image_url: book.image_url || "",
      handle: book.handle,
      in_stock: book.in_stock ?? true,
      featured: book.featured ?? false,
    });
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingBook(null);
    setEditForm({
      title: "",
      author: "",
      description: "",
      price: "",
      original_price: "",
      category: "",
      image_url: "",
      handle: "",
      in_stock: true,
      featured: false,
    });
  };

  const handleSave = async () => {
    try {
      const bookData = {
        title: editForm.title,
        author: editForm.author || null,
        description: editForm.description || null,
        price: parseFloat(editForm.price) || 0,
        original_price: editForm.original_price ? parseFloat(editForm.original_price) : null,
        category: editForm.category || null,
        image_url: editForm.image_url || null,
        handle: editForm.handle || editForm.title.toLowerCase().replace(/\s+/g, "-"),
        in_stock: editForm.in_stock,
        featured: editForm.featured,
      };

      if (isCreating) {
        await addBook(bookData);
        toast.success("Livro criado com sucesso!");
      } else if (editingBook) {
        await updateBook(editingBook.id, bookData);
        toast.success("Livro atualizado com sucesso!");
      }
      setEditingBook(null);
      setIsCreating(false);
    } catch (error) {
      toast.error("Erro ao salvar livro");
    }
  };

  const handleDeleteBook = async (book: Book) => {
    if (!confirm(`Tem certeza que deseja excluir "${book.title}"?`)) return;
    try {
      await deleteBook(book.id);
      toast.success("Livro excluído com sucesso!");
    } catch (error) {
      toast.error("Erro ao excluir livro");
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${userName}"?`)) return;
    try {
      await deleteUser(userId);
      toast.success("Usuário excluído com sucesso!");
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
    if (!confirm("Tem certeza que deseja excluir este contato?")) return;
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
      toast.success("Configurações de aparência salvas!");
    } catch (error) {
      toast.error("Erro ao salvar configurações");
    }
  };

  const handleSaveContactInfo = async () => {
    try {
      await updateSetting("contact", contactInfo);
      toast.success("Informações de contato salvas!");
    } catch (error) {
      toast.error("Erro ao salvar informações de contato");
    }
  };

  // Test data generation functions
  const generateRandomProfile = async () => {
    setGenerating(true);
    try {
      const names = ["Maria Silva", "Ana Santos", "Julia Oliveira", "Carla Souza", "Paula Lima", "Fernanda Costa"];
      const name = `Teste - ${names[Math.floor(Math.random() * names.length)]}`;
      
      // Create a fake profile entry (without actual auth user)
      const { error } = await supabase.from('profiles').insert({
        user_id: crypto.randomUUID(),
        full_name: name,
      });

      if (error) throw error;
      toast.success(`Perfil de teste "${name}" criado!`);
      refetchUsers();
    } catch (error) {
      toast.error("Erro ao gerar perfil");
    } finally {
      setGenerating(false);
    }
  };

  const generateRandomBook = async () => {
    setGenerating(true);
    try {
      const titles = [
        "[TEST] O Jardim Secreto",
        "[TEST] A Última Rosa",
        "[TEST] Caminhos do Coração",
        "[TEST] Noites de Verão",
        "[TEST] O Segredo da Lua",
        "[TEST] Flores de Inverno",
      ];
      const authors = ["Emily Rose", "Clara Mendes", "Sophia Bennett", "Lucia Torres"];
      const baseTitle = titles[Math.floor(Math.random() * titles.length)];
      const title = `${baseTitle} ${Math.floor(Math.random() * 100)}`;
      const author = authors[Math.floor(Math.random() * authors.length)];
      const price = (Math.random() * 80 + 20).toFixed(2);

      await addBook({
        title,
        author,
        description: `Uma história envolvente sobre ${baseTitle.toLowerCase()}.`,
        price: parseFloat(price),
        original_price: parseFloat(price) + 20,
        category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
        image_url: null,
        handle: title.toLowerCase().replace(/\s+/g, "-"),
        in_stock: true,
        featured: Math.random() > 0.5,
      });

      toast.success(`Livro "${title}" criado!`);
    } catch (error) {
      toast.error("Erro ao gerar livro");
    } finally {
      setGenerating(false);
    }
  };

  const generateRandomPurchase = async () => {
    setGenerating(true);
    try {
      if (books.length === 0) {
        toast.error("Adicione livros primeiro!");
        return;
      }

      const book = books[Math.floor(Math.random() * books.length)];
      const { data: profiles } = await supabase.from('profiles').select('user_id').limit(1);
      
      if (!profiles || profiles.length === 0) {
        toast.error("Adicione usuários primeiro!");
        return;
      }

      const { error } = await supabase.from('purchase_history').insert({
        user_id: profiles[0].user_id,
        order_id: `TEST-${Date.now()}`,
        product_handle: book.handle,
        product_title: book.title,
        product_image: book.image_url,
        product_price: book.price,
        quantity: Math.floor(Math.random() * 3) + 1,
      });

      if (error) throw error;
      toast.success(`Compra de "${book.title}" registrada!`);
    } catch (error) {
      toast.error("Erro ao gerar compra");
    } finally {
      setGenerating(false);
    }
  };

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Painel Administrativo | Orbe Livros</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <Header />

      <main className="min-h-screen pt-24 pb-16">
        <div className="container">
          {/* Admin Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-3xl font-bold text-foreground">
                Painel Administrativo
              </h1>
              <p className="text-muted-foreground">Gerencie todos os aspectos da loja</p>
            </div>
          </div>

          <Tabs defaultValue="books" className="space-y-6">
            <TabsList className="grid w-full grid-cols-9 lg:w-auto lg:inline-grid">
              <TabsTrigger value="books" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Livros</span>
              </TabsTrigger>
              <TabsTrigger value="promotions" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <span className="hidden sm:inline">Promoções</span>
              </TabsTrigger>
              <TabsTrigger value="comments" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Comentários</span>
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
                <span className="hidden sm:inline">Estética</span>
              </TabsTrigger>
              <TabsTrigger value="tests" className="flex items-center gap-2">
                <TestTube className="h-4 w-4" />
                <span className="hidden sm:inline">Testes</span>
              </TabsTrigger>
            </TabsList>

            {/* Books Tab */}
            <TabsContent value="books" className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar livros..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Livro
                </Button>
                <Button variant="outline" onClick={refetchBooks}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              {booksLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredBooks.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum livro encontrado</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredBooks.map((book) => (
                    <Card key={book.id}>
                      <CardContent className="pt-4">
                        <div className="flex gap-3">
                          {book.image_url ? (
                            <img
                              src={book.image_url}
                              alt={book.title}
                              className="w-16 h-24 object-cover rounded"
                            />
                          ) : (
                            <div className="w-16 h-24 bg-muted rounded flex items-center justify-center">
                              <BookOpen className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm truncate">{book.title}</h3>
                            <p className="text-xs text-muted-foreground truncate">{book.author}</p>
                            <p className="text-sm text-primary font-semibold mt-1">
                              R$ {book.price.toFixed(2).replace(".", ",")}
                            </p>
                            <div className="flex gap-1 mt-2">
                              {book.featured && <Badge variant="secondary" className="text-xs">Destaque</Badge>}
                              {book.category && <Badge variant="outline" className="text-xs">{book.category}</Badge>}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEdit(book)}>
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteBook(book)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Promotions Tab */}
            <TabsContent value="promotions">
              <PromotionsManager />
            </TabsContent>

            {/* Comments Tab */}
            <TabsContent value="comments">
              <CommentsManager />
            </TabsContent>

            {/* Contacts Tab */}
            <TabsContent value="contacts" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="font-serif text-xl font-semibold">Mensagens de Clientes</h2>
                <Button variant="outline" size="sm" onClick={refetchContacts}>
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
                    <p className="text-muted-foreground">Nenhuma mensagem recebida</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {contacts.map((contact) => (
                    <Card key={contact.id}>
                      <CardContent className="pt-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{contact.name}</span>
                              <Badge variant={contact.status === "resolved" ? "default" : "secondary"}>
                                {contact.status === "resolved" ? (
                                  <><CheckCircle className="h-3 w-3 mr-1" /> Resolvido</>
                                ) : (
                                  <><Clock className="h-3 w-3 mr-1" /> Pendente</>
                                )}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                              <Mail className="h-3 w-3" />
                              {contact.email}
                            </div>
                            <p className="text-sm font-medium mb-1">{contact.subject}</p>
                            <p className="text-sm text-muted-foreground">{contact.message}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(contact.created_at).toLocaleString("pt-BR")}
                            </p>
                          </div>
                          <div className="flex sm:flex-col gap-2">
                            <Select
                              value={contact.status}
                              onValueChange={(value) => handleContactStatus(contact.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pendente</SelectItem>
                                <SelectItem value="in_progress">Em Andamento</SelectItem>
                                <SelectItem value="resolved">Resolvido</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteContact(contact.id)}>
                              <Trash2 className="h-4 w-4" />
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
                <h2 className="font-serif text-xl font-semibold">Usuários Cadastrados</h2>
                <Button variant="outline" size="sm" onClick={refetchUsers}>
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
                    <p className="text-muted-foreground">Nenhum usuário cadastrado</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.map((u) => (
                    <Card key={u.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{u.full_name || "Sem nome"}</p>
                            <p className="text-xs text-muted-foreground truncate">{u.user_id}</p>
                            <Badge variant={u.role === "admin" ? "default" : "secondary"} className="mt-1">
                              {u.role}
                            </Badge>
                          </div>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(u.user_id, u.full_name || "Usuário")}>
                            <Trash2 className="h-4 w-4" />
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
              {/* Contact Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Informações de Contato
                  </CardTitle>
                  <CardDescription>Configure telefone, email, endereço e redes sociais exibidos no site</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={contactInfo.phone}
                        onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={contactInfo.email}
                        onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                        placeholder="contato@exemplo.com.br"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço / Localização</Label>
                    <Input
                      id="address"
                      value={contactInfo.address}
                      onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                      placeholder="São Paulo, Brasil"
                    />
                  </div>
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium mb-3">Redes Sociais</h4>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="instagram">Instagram</Label>
                        <Input
                          id="instagram"
                          value={contactInfo.instagram}
                          onChange={(e) => setContactInfo({ ...contactInfo, instagram: e.target.value })}
                          placeholder="https://instagram.com/..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="facebook">Facebook</Label>
                        <Input
                          id="facebook"
                          value={contactInfo.facebook}
                          onChange={(e) => setContactInfo({ ...contactInfo, facebook: e.target.value })}
                          placeholder="https://facebook.com/..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="twitter">Twitter / X</Label>
                        <Input
                          id="twitter"
                          value={contactInfo.twitter}
                          onChange={(e) => setContactInfo({ ...contactInfo, twitter: e.target.value })}
                          placeholder="https://twitter.com/..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="youtube">YouTube</Label>
                        <Input
                          id="youtube"
                          value={contactInfo.youtube}
                          onChange={(e) => setContactInfo({ ...contactInfo, youtube: e.target.value })}
                          placeholder="https://youtube.com/..."
                        />
                      </div>
                    </div>
                  </div>
                  <Button onClick={handleSaveContactInfo}>
                    Salvar Informações de Contato
                  </Button>
                </CardContent>
              </Card>

              {/* Appearance Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Personalização do Site
                  </CardTitle>
                  <CardDescription>Configure a aparência da loja</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="storeName">Nome da Loja</Label>
                      <Input
                        id="storeName"
                        value={siteSettings.storeName}
                        onChange={(e) => setSiteSettings({ ...siteSettings, storeName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">Cor Principal</Label>
                      <div className="flex gap-2">
                        <Input
                          id="primaryColor"
                          type="color"
                          value={siteSettings.primaryColor}
                          onChange={(e) => setSiteSettings({ ...siteSettings, primaryColor: e.target.value })}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={siteSettings.primaryColor}
                          onChange={(e) => setSiteSettings({ ...siteSettings, primaryColor: e.target.value })}
                          placeholder="#d4a5a5"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="heroTitle">Título do Hero</Label>
                    <Input
                      id="heroTitle"
                      value={siteSettings.heroTitle}
                      onChange={(e) => setSiteSettings({ ...siteSettings, heroTitle: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="heroSubtitle">Subtítulo do Hero</Label>
                    <Textarea
                      id="heroSubtitle"
                      value={siteSettings.heroSubtitle}
                      onChange={(e) => setSiteSettings({ ...siteSettings, heroSubtitle: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleSaveSettings}>
                    Salvar Aparência
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tests Tab */}
            <TabsContent value="tests" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif flex items-center gap-2">
                    <TestTube className="h-5 w-5" />
                    Geração de Dados de Teste
                  </CardTitle>
                  <CardDescription>Popule e limpe o banco de dados com dados de teste (apenas ambiente de desenvolvimento)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <Button
                      variant="outline"
                      onClick={generateRandomProfile}
                      disabled={generating}
                      className="h-auto py-4 flex flex-col gap-2"
                    >
                      {generating ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        <User className="h-6 w-6" />
                      )}
                      <span>Gerar Perfil</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={generateRandomBook}
                      disabled={generating}
                      className="h-auto py-4 flex flex-col gap-2"
                    >
                      {generating ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        <BookOpen className="h-6 w-6" />
                      )}
                      <span>Gerar Livro</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={generateRandomPurchase}
                      disabled={generating}
                      className="h-auto py-4 flex flex-col gap-2"
                    >
                      {generating ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        <RefreshCw className="h-6 w-6" />
                      )}
                      <span>Gerar Compra</span>
                    </Button>
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Use os botões abaixo para limpar apenas dados de teste gerados automaticamente. Dados reais de clientes não serão afetados.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        variant="destructive"
                        disabled={generating}
                        className="flex-1"
                        onClick={async () => {
                          if (!confirm("Tem certeza que deseja apagar TODOS os dados de teste?")) return;
                          setGenerating(true);
                          try {
                            await supabase.from('purchase_history').delete().like('order_id', 'TEST-%');
                            await supabase.from('books').delete().like('title', '[TEST]%');
                            await supabase.from('profiles').delete().like('full_name', 'Teste - %');
                            toast.success("Dados de teste removidos com sucesso!");
                            refetchBooks();
                            refetchUsers();
                            refetchContacts();
                          } catch (error) {
                            toast.error("Erro ao limpar dados de teste");
                          } finally {
                            setGenerating(false);
                          }
                        }}
                      >
                        Limpar dados de teste
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Edit/Create Modal */}
      {(editingBook || isCreating) && (
        <div className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl my-8">
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                {isCreating ? <Plus className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
                {isCreating ? "Novo Livro" : "Editar Livro"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author">Autor</Label>
                  <Input
                    id="author"
                    value={editForm.author}
                    onChange={(e) => setEditForm({ ...editForm, author: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="original_price">Preço Original (R$)</Label>
                  <Input
                    id="original_price"
                    type="number"
                    step="0.01"
                    value={editForm.original_price}
                    onChange={(e) => setEditForm({ ...editForm, original_price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={editForm.category}
                    onValueChange={(value) => setEditForm({ ...editForm, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="handle">Handle (URL)</Label>
                  <Input
                    id="handle"
                    value={editForm.handle}
                    onChange={(e) => setEditForm({ ...editForm, handle: e.target.value })}
                    placeholder="titulo-do-livro"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image_url">URL da Imagem</Label>
                  <Input
                    id="image_url"
                    value={editForm.image_url}
                    onChange={(e) => setEditForm({ ...editForm, image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editForm.in_stock}
                    onChange={(e) => setEditForm({ ...editForm, in_stock: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Em estoque</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editForm.featured}
                    onChange={(e) => setEditForm({ ...editForm, featured: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Destaque</span>
                </label>
              </div>
              <div className="flex gap-4 pt-4">
                <Button onClick={handleSave}>
                  {isCreating ? "Criar Livro" : "Salvar Alterações"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingBook(null);
                    setIsCreating(false);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Footer />
    </>
  );
};

export default Admin;
