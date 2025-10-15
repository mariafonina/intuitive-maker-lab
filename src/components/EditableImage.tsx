import { useState } from "react";
import { ImagePlus } from "lucide-react";
import { ImageGalleryDialog } from "./ImageGalleryDialog";

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
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(() => {
    // Загружаем сохраненное изображение из localStorage
    return localStorage.getItem(`image_${storageKey}`) || null;
  });

  const handleImageSelect = (url: string) => {
    setSelectedImageUrl(url);
    localStorage.setItem(`image_${storageKey}`, url);
    setIsDialogOpen(false);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'max-w-sm mx-auto h-64';
      case 'full':
        return 'w-full h-[500px]';
      default:
        return 'w-full max-w-2xl mx-auto h-80';
    }
  };

  if (selectedImageUrl) {
    return (
      <>
        <div 
          className={`relative group cursor-pointer rounded-2xl overflow-hidden ${getSizeClasses()} ${className}`}
          onClick={() => setIsDialogOpen(true)}
        >
          <img 
            src={selectedImageUrl} 
            alt="Selected content" 
            className="w-full h-full object-contain bg-muted"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <p className="text-white text-sm font-medium">Изменить изображение</p>
          </div>
        </div>
        <ImageGalleryDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSelectImage={handleImageSelect}
        />
      </>
    );
  }

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
      />
    </>
  );
};
