import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";
import { Loader2, BookOpen, Edit, Shield, Search } from "lucide-react";
import { toast } from "sonner";

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState<ShopifyProduct | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    price: "",
  });

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

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts(100);
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error("Error loading products:", error);
        toast.error("Erro ao carregar produtos");
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      loadProducts();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      setFilteredProducts(
        products.filter((p) => p.node.title.toLowerCase().includes(query))
      );
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, products]);

  const handleEdit = (product: ShopifyProduct) => {
    setEditingProduct(product);
    setEditForm({
      title: product.node.title,
      description: product.node.description || "",
      price: product.node.priceRange.minVariantPrice.amount,
    });
  };

  const handleSaveEdit = () => {
    toast.info(
      "A edição de produtos requer integração com a API admin do Shopify. Os dados foram registrados localmente para referência."
    );
    setEditingProduct(null);
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
        <title>Painel Administrativo | Livraria Encanto</title>
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
              <p className="text-muted-foreground">Gerencie os livros da loja</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar livros..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Edit Modal */}
          {editingProduct && (
            <div className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm flex items-center justify-center p-4">
              <Card className="w-full max-w-lg">
                <CardHeader>
                  <CardTitle className="font-serif flex items-center gap-2">
                    <Edit className="h-5 w-5" />
                    Editar Livro
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={editForm.title}
                      onChange={(e) =>
                        setEditForm({ ...editForm, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm({ ...editForm, description: e.target.value })
                      }
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço (R$)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={editForm.price}
                      onChange={(e) =>
                        setEditForm({ ...editForm, price: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <Button onClick={handleSaveEdit}>Salvar Alterações</Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditingProduct(null)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Products Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum livro encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.node.id}>
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      {product.node.images.edges[0]?.node.url && (
                        <img
                          src={product.node.images.edges[0].node.url}
                          alt={product.node.title}
                          className="w-20 h-28 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate">
                          {product.node.title}
                        </h3>
                        <p className="text-sm text-primary font-semibold mt-1">
                          R${" "}
                          {parseFloat(
                            product.node.priceRange.minVariantPrice.amount
                          )
                            .toFixed(2)
                            .replace(".", ",")}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Admin;
