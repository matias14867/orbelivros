import { useSiteSettings } from './useSiteSettings';

// Default images
import heroImage from "@/assets/hero-books.jpg";

const DEFAULT_IMAGES = {
  logo: "",
  heroImage: heroImage,
  favicon: "",
};

export function useSiteImages() {
  const { settings, loading } = useSiteSettings();
  
  const getImage = (key: string): string => {
    if (settings.images && settings.images[key]) {
      return settings.images[key];
    }
    return DEFAULT_IMAGES[key as keyof typeof DEFAULT_IMAGES] || "";
  };

  return {
    images: { ...DEFAULT_IMAGES, ...(settings.images || {}) },
    getImage,
    loading,
  };
}
