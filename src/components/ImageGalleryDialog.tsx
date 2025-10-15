import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

interface Image {
  id: string;
  url: string;
  filename: string;
}

interface ImageGalleryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectImage: (url: string, size?: 'small' | 'medium' | 'full') => void;
  showSizeSelector?: boolean;
}

export const ImageGalleryDialog = ({
  open,
  onOpenChange,
  onSelectImage,
  showSizeSelector = false,
}: ImageGalleryDialogProps) => {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'full'>('medium');

  useEffect(() => {
    if (open) {
      loadImages();
    }
  }, [open]);

  const loadImages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("images")
        .select("*")
        .order("uploaded_at", { ascending: false });

      if (error) throw error;

      setImages(
        data.map((img) => ({
          id: img.id,
          url: img.url,
          filename: img.filename,
        }))
      );
    } catch (error) {
      console.error("Error loading images:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (url: string) => {
    if (showSizeSelector) {
      setSelectedImageUrl(url);
    } else {
      onSelectImage(url);
    }
  };

  const handleConfirmSelection = () => {
    if (selectedImageUrl) {
      onSelectImage(selectedImageUrl, selectedSize);
      setSelectedImageUrl(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            {selectedImageUrl && showSizeSelector ? 'Выберите размер изображения' : 'Выберите изображение из галереи'}
          </DialogTitle>
          <DialogDescription>
            {selectedImageUrl && showSizeSelector 
              ? 'Выберите размер для отображения изображения'
              : 'Кликните на изображение, чтобы использовать его в статье'
            }
          </DialogDescription>
        </DialogHeader>
        
        {selectedImageUrl && showSizeSelector ? (
          <div className="space-y-6 p-4">
            <div className="flex justify-center">
              <img 
                src={selectedImageUrl} 
                alt="Preview" 
                className={`rounded-lg ${
                  selectedSize === 'small' ? 'max-w-sm h-64' :
                  selectedSize === 'full' ? 'w-full h-[300px]' :
                  'max-w-2xl h-80'
                } object-contain bg-muted`}
              />
            </div>
            
            <div className="space-y-3">
              <p className="text-sm font-medium">Размер изображения:</p>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setSelectedSize('small')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedSize === 'small' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-muted-foreground/30 hover:border-primary/50'
                  }`}
                >
                  <p className="font-medium">Маленькое</p>
                  <p className="text-xs text-muted-foreground mt-1">256px высота</p>
                </button>
                <button
                  onClick={() => setSelectedSize('medium')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedSize === 'medium' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-muted-foreground/30 hover:border-primary/50'
                  }`}
                >
                  <p className="font-medium">Среднее</p>
                  <p className="text-xs text-muted-foreground mt-1">320px высота</p>
                </button>
                <button
                  onClick={() => setSelectedSize('full')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedSize === 'full' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-muted-foreground/30 hover:border-primary/50'
                  }`}
                >
                  <p className="font-medium">Полноразмерное</p>
                  <p className="text-xs text-muted-foreground mt-1">500px высота</p>
                </button>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedImageUrl(null)}
                className="flex-1 px-4 py-2 rounded-lg border-2 border-muted-foreground/30 hover:border-primary/50 transition-all"
              >
                Назад
              </button>
              <button
                onClick={handleConfirmSelection}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-medium"
              >
                Применить
              </button>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-[500px] w-full">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : images.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <p>Галерея пуста</p>
                <p className="text-sm mt-2">Загрузите изображения в разделе "Галерея изображений"</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="relative aspect-square cursor-pointer group rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all"
                    onClick={() => handleImageClick(image.url)}
                  >
                    <img
                      src={image.url}
                      alt={image.filename}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white text-sm font-medium text-center px-2">
                        {image.filename}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};
