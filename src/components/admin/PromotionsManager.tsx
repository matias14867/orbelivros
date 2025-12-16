import { useState, useEffect } from "react";
import { usePromotions, Promotion } from "@/hooks/usePromotions";
import { useBooks, Book } from "@/hooks/useBooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Loader2,
  Plus,
  Trash2,
  Edit,
  Tag,
  Percent,
  Calendar,
  Palette,
  BookOpen,
  X,
  Save,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

const PromotionsManager = () => {
  const { promotions, loading, createPromotion, updatePromotion, deletePromotion, getPromotionBooks, setPromotionBooks, refetch } = usePromotions();
  const { books, loading: booksLoading } = useBooks();
  
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    discount_percentage: 10,
    theme_color: "#E91E63",
    is_active: false,
    start_date: "",
    end_date: "",
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      discount_percentage: 10,
      theme_color: "#E91E63",
      is_active: false,
      start_date: "",
      end_date: "",
    });
    setSelectedBooks([]);
    setEditingPromotion(null);
    setIsCreating(false);
  };

  const handleCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const handleEdit = async (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setIsCreating(false);
    setFormData({
      title: promotion.title,
      description: promotion.description || "",
      discount_percentage: promotion.discount_percentage,
      theme_color: promotion.theme_color || "#E91E63",
      is_active: promotion.is_active,
      start_date: promotion.start_date ? promotion.start_date.split("T")[0] : "",
      end_date: promotion.end_date ? promotion.end_date.split("T")[0] : "",
    });

    const bookIds = await getPromotionBooks(promotion.id);
    setSelectedBooks(bookIds);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error("Título é obrigatório");
      return;
    }

    if (selectedBooks.length === 0) {
      toast.error("Selecione pelo menos um livro");
      return;
    }

    try {
      const promotionData = {
        title: formData.title,
        description: formData.description || null,
        discount_percentage: formData.discount_percentage,
        theme_color: formData.theme_color,
        is_active: formData.is_active,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        created_by: null,
      };

      if (isCreating) {
        const newPromotion = await createPromotion(promotionData);
        await setPromotionBooks(newPromotion.id, selectedBooks);
        toast.success("Promoção criada com sucesso!");
      } else if (editingPromotion) {
        await updatePromotion(editingPromotion.id, promotionData);
        await setPromotionBooks(editingPromotion.id, selectedBooks);
        toast.success("Promoção atualizada!");
      }

      resetForm();
    } catch (error) {
      console.error("Error saving promotion:", error);
      toast.error("Erro ao salvar promoção");
    }
  };

  const handleDelete = async (promotion: Promotion) => {
    if (!confirm(`Excluir promoção "${promotion.title}"?`)) return;

    try {
      await deletePromotion(promotion.id);
      toast.success("Promoção excluída!");
    } catch (error) {
      toast.error("Erro ao excluir promoção");
    }
  };

  const toggleBookSelection = (bookId: string) => {
    setSelectedBooks(prev =>
      prev.includes(bookId)
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const showForm = isCreating || editingPromotion;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Promoções Especiais</h2>
          <p className="text-sm text-muted-foreground">
            Crie promoções temáticas com descontos especiais
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={refetch}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          {!showForm && (
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Promoção
            </Button>
          )}
        </div>
      </div>

      {showForm && (
        <Card className="border-primary/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {isCreating ? "Nova Promoção" : "Editar Promoção"}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título da Promoção *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Promoção de Natal"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount">Desconto (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="1"
                  max="90"
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData({ ...formData, discount_percentage: parseInt(e.target.value) || 10 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição da Promoção</Label>
              <Textarea
                id="description"
                placeholder="Conte sobre a promoção, o tema do feriado, etc..."
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color">Cor do Tema</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    className="w-14 h-10 p-1 cursor-pointer"
                    value={formData.theme_color}
                    onChange={(e) => setFormData({ ...formData, theme_color: e.target.value })}
                  />
                  <Input
                    value={formData.theme_color}
                    onChange={(e) => setFormData({ ...formData, theme_color: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="start_date">Data Início</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">Data Fim</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Promoção Ativa</Label>
            </div>

            {/* Book Selection */}
            <div className="space-y-3">
              <Label>Livros na Promoção ({selectedBooks.length} selecionados)</Label>
              <ScrollArea className="h-64 border rounded-md p-3">
                {booksLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {books.map((book) => (
                      <label
                        key={book.id}
                        className="flex items-center gap-3 p-2 rounded hover:bg-muted cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedBooks.includes(book.id)}
                          onCheckedChange={() => toggleBookSelection(book.id)}
                        />
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {book.image_url ? (
                            <img
                              src={book.image_url}
                              alt={book.title}
                              className="w-8 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-8 h-12 bg-muted rounded flex items-center justify-center">
                              <BookOpen className="h-3 w-3 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{book.title}</p>
                            <p className="text-xs text-muted-foreground">
                              R$ {book.price.toFixed(2).replace(".", ",")}
                            </p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Promotions List */}
      {promotions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma promoção criada</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {promotions.map((promotion) => (
            <Card key={promotion.id} className="overflow-hidden">
              <div
                className="h-2"
                style={{ backgroundColor: promotion.theme_color || "#E91E63" }}
              />
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{promotion.title}</h3>
                      {promotion.is_active ? (
                        <Badge className="bg-green-500/10 text-green-600 border-green-200">
                          Ativa
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inativa</Badge>
                      )}
                      <Badge variant="outline" className="gap-1">
                        <Percent className="h-3 w-3" />
                        {promotion.discount_percentage}% OFF
                      </Badge>
                    </div>
                    {promotion.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {promotion.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {promotion.start_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(promotion.start_date).toLocaleDateString("pt-BR")}
                          {promotion.end_date && ` - ${new Date(promotion.end_date).toLocaleDateString("pt-BR")}`}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(promotion)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(promotion)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PromotionsManager;
