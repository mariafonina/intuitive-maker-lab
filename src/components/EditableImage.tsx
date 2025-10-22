import { useState, useEffect } from "react";
import { ImagePlus, X } from "lucide-react";
import { ImageGalleryDialog } from "./ImageGalleryDialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/contexts/AdminContext";

interface EditableImageProps {
  placeholder?: string;
  className?: string;
  storageKey: string; // Уникальный ключ для сохранения выбранного изображения
  size?: 'small' | 'medium' | 'full'; // Размер изображения
}

export const EditableImage = ({ 
  placeholder = "Кликните для выбора изображения",
  className = "",
  storageKey,
  size = 'medium'
}: EditableImageProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [currentSize, setCurrentSize] = useState<'small' | 'medium' | 'full'>(size);
  const [caption, setCaption] = useState<string>('');
  const [isImageLoading, setIsImageLoading] = useState(true);
  const { isAdmin, isLoading: isAdminLoading } = useAdmin();

  // Load image data from database on mount
  useEffect(() => {
    loadImageFromDB();
  }, [storageKey]);

  // Fallback: seed from localStorage if DB is empty
  useEffect(() => {
    if (!isImageLoading && !selectedImageUrl) {
      const lsUrl = localStorage.getItem(`image_${storageKey}`);
      const lsSize = (localStorage.getItem(`image_size_${storageKey}`) as 'small' | 'medium' | 'full') || size;
      const lsCaption = localStorage.getItem(`image_caption_${storageKey}`) || '';
      if (lsUrl) {
        supabase
          .from('site_images')
          .upsert(
            [{
              storage_key: storageKey,
              image_url: lsUrl,
              image_size: lsSize,
              caption: lsCaption,
            }],
            { onConflict: 'storage_key' }
          );
        setSelectedImageUrl(lsUrl);
        setCurrentSize(lsSize);
        setCaption(lsCaption);
      }
    }
  }, [isImageLoading, selectedImageUrl, storageKey, size]);

  const loadImageFromDB = async () => {
    try {
      const { data, error } = await supabase
        .from('site_images')
        .select('*')
        .eq('storage_key', storageKey)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading image:', error);
      }

      if (data) {
        setSelectedImageUrl(data.image_url);
        setCurrentSize(data.image_size as 'small' | 'medium' | 'full');
        setCaption(data.caption || '');
      }
    } catch (error) {
      console.error('Error loading image:', error);
    } finally {
      setIsImageLoading(false);
    }
  };

  const handleImageSelect = async (url: string, newSize?: 'small' | 'medium' | 'full') => {
    const finalSize = newSize || currentSize;
    
    setSelectedImageUrl(url);
    setCurrentSize(finalSize);
    setIsDialogOpen(false);

    try {
      await supabase
        .from('site_images')
        .upsert(
          [{
            storage_key: storageKey,
            image_url: url,
            image_size: finalSize,
            caption: caption,
          }],
          { onConflict: 'storage_key' }
        );
    } catch (error) {
      console.error('Error saving image:', error);
    }
  };

  const handleCaptionChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCaption = e.target.value;
    setCaption(newCaption);

    try {
      if (selectedImageUrl) {
        await supabase
          .from('site_images')
          .upsert(
            [{
              storage_key: storageKey,
              image_url: selectedImageUrl,
              image_size: currentSize,
              caption: newCaption,
            }],
            { onConflict: 'storage_key' }
          );
      }
    } catch (error) {
      console.error('Error updating caption:', error);
    }
  };

  const handleDeleteImage = async () => {
    try {
      await supabase
        .from('site_images')
        .delete()
        .eq('storage_key', storageKey);
      
      setSelectedImageUrl(null);
      setCaption('');
      setCurrentSize(size);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const getSizeClasses = () => {
    switch (currentSize) {
      case 'small':
        return 'max-w-sm mx-auto h-64';
      case 'full':
        return 'w-full h-[500px]';
      default:
        return 'w-full max-w-2xl mx-auto h-80';
    }
  };

  if (selectedImageUrl) {
    // Read-only mode for non-admins
    if (!isAdmin) {
      return (
        <div className={className}>
          <div className={`rounded-2xl overflow-hidden ${getSizeClasses()}`}>
            <img 
              src={selectedImageUrl} 
              alt={caption || "Content image"} 
              className="w-full h-full object-contain bg-muted"
            />
          </div>
          {caption && (
            <p className="mt-3 text-sm text-center italic text-muted-foreground">
              {caption}
            </p>
          )}
        </div>
      );
    }

    // Editable mode for admins
    return (
      <div className={className}>
        <div 
          className={`relative group cursor-pointer rounded-2xl overflow-hidden ${getSizeClasses()}`}
          onClick={() => setIsDialogOpen(true)}
        >
          <img 
            src={selectedImageUrl} 
            alt={caption || "Selected content"} 
            className="w-full h-full object-contain bg-muted"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
            <p className="text-white text-sm font-medium">Изменить изображение</p>
          </div>
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteImage();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Input
          type="text"
          value={caption}
          onChange={handleCaptionChange}
          placeholder="Добавить подпись к изображению..."
          className="mt-3 text-sm text-center italic"
          onClick={(e) => e.stopPropagation()}
        />
        <ImageGalleryDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSelectImage={handleImageSelect}
          showSizeSelector={true}
        />
      </div>
    );
  }

  // Non-admins see nothing if no image is selected
  if (!isAdmin) {
    return null;
  }

  // Admins can add images
  return (
    <>
      <div 
        className={`border-2 border-dashed border-muted-foreground/30 rounded-2xl p-8 cursor-pointer hover:border-primary hover:bg-muted/50 transition-all ${getSizeClasses()} ${className}`}
        onClick={() => setIsDialogOpen(true)}
      >
        <div className="flex flex-col items-center justify-center gap-3 h-full">
          <ImagePlus className="w-12 h-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground font-medium">{placeholder}</p>
        </div>
      </div>
      <ImageGalleryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSelectImage={handleImageSelect}
        showSizeSelector={true}
      />
    </>
  );
};
