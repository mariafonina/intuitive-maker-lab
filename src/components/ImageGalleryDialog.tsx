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
  onSelectImage: (url: string) => void;
}

export const ImageGalleryDialog = ({
  open,
  onOpenChange,
  onSelectImage,
}: ImageGalleryDialogProps) => {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Выберите изображение из галереи</DialogTitle>
          <DialogDescription>
            Кликните на изображение, чтобы использовать его в статье
          </DialogDescription>
        </DialogHeader>
        
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
                  onClick={() => onSelectImage(image.url)}
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
      </DialogContent>
    </Dialog>
  );
};
