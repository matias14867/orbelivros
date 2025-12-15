import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Image as ImageIcon, 
  Upload, 
  Loader2, 
  Save, 
  Trash2,
  X
} from "lucide-react";

interface ImageField {
  key: string;
  label: string;
  description: string;
  aspectRatio?: string;
}

const IMAGE_FIELDS: ImageField[] = [
  { key: "logo", label: "Logo da Loja", description: "Logo exibido no cabeçalho (recomendado: 200x60px)", aspectRatio: "200/60" },
  { key: "heroImage", label: "Imagem do Hero", description: "Banner principal da página inicial (recomendado: 1920x1080px)", aspectRatio: "16/9" },
  { key: "favicon", label: "Favicon", description: "Ícone do site na aba do navegador (recomendado: 32x32px)", aspectRatio: "1/1" },
];

export function SiteImagesEditor() {
  const { settings, updateSetting, loading } = useSiteSettings();
  const [images, setImages] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (settings.images) {
      setImages(settings.images as Record<string, string>);
    }
  }, [settings]);

  const uploadImage = async (key: string, file: File) => {
    setUploading((prev) => ({ ...prev, [key]: true }));
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${key}-${Date.now()}.${fileExt}`;
      const filePath = `site/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('site-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('site-images')
        .getPublicUrl(filePath);

      setImages((prev) => ({ ...prev, [key]: publicUrl }));
      toast.success(`${IMAGE_FIELDS.find(f => f.key === key)?.label} carregada com sucesso!`);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`Erro ao fazer upload: ${error.message}`);
    } finally {
      setUploading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleFileChange = (key: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione apenas arquivos de imagem');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo 5MB');
        return;
      }
      uploadImage(key, file);
    }
  };

  const removeImage = (key: string) => {
    setImages((prev) => {
      const newImages = { ...prev };
      delete newImages[key];
      return newImages;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSetting("images", images);
      toast.success("Imagens salvas com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar imagens");
    } finally {
      setSaving(false);
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
            <ImageIcon className="h-5 w-5" />
            Editor de Imagens do Site
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Faça upload das imagens do site. As alterações são aplicadas após salvar.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Salvar Imagens
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {IMAGE_FIELDS.map((field) => (
          <Card key={field.key}>
            <CardHeader>
              <CardTitle className="font-serif text-lg">{field.label}</CardTitle>
              <CardDescription>{field.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {images[field.key] ? (
                <div className="relative group">
                  <div 
                    className="relative overflow-hidden rounded-lg border border-border bg-muted"
                    style={{ aspectRatio: field.aspectRatio || "16/9" }}
                  >
                    <img
                      src={images[field.key]}
                      alt={field.label}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(field.key)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div 
                  className="flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                  style={{ aspectRatio: field.aspectRatio || "16/9" }}
                  onClick={() => fileInputRefs.current[field.key]?.click()}
                >
                  <div className="text-center p-4">
                    <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Clique para fazer upload
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <Input
                  ref={(el) => (fileInputRefs.current[field.key] = el)}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(field.key, e)}
                />
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={uploading[field.key]}
                  onClick={() => fileInputRefs.current[field.key]?.click()}
                >
                  {uploading[field.key] ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {images[field.key] ? "Substituir" : "Upload"}
                </Button>
                {images[field.key] && (
                  <Button
                    variant="outline"
                    onClick={() => removeImage(field.key)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-1">
                <Label>Ou insira a URL da imagem</Label>
                <Input
                  placeholder="https://exemplo.com/imagem.jpg"
                  value={images[field.key] || ""}
                  onChange={(e) => setImages((prev) => ({ ...prev, [field.key]: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
