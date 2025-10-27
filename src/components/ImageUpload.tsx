import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export const ImageUpload = () => {
  const [images, setImages] = useState<Array<{ id: string; url: string; filename: string }>>([]);
  
  const { uploading, progress, uploadMultiple } = useImageUpload({
    saveToDatabase: true,
    maxFileSizeMB: 10,
    onSuccess: () => loadImages(),
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const files = Array.from(event.target.files);
    const results = await uploadMultiple(files);
    
    if (results.length > 0) {
      setImages(prev => [...prev, ...results.map(r => ({ 
        id: r.id || '', 
        url: r.url, 
        filename: r.filename 
      }))]);
    }

    if (event.target) {
      event.target.value = '';
    }
  };

  const loadImages = async () => {
    const { data } = await supabase
      .from('images')
      .select('*')
      .order('uploaded_at', { ascending: false });
    
    if (data) {
      setImages(data.map(img => ({ id: img.id, url: img.url, filename: img.filename })));
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Загрузить изображение</h2>
        
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Максимальный размер файла: 10МБ. Изображения автоматически сжимаются до 1920px.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              disabled={uploading}
              className="flex-1"
            />
            {uploading && <Loader2 className="animate-spin" />}
          </div>
          
          {uploading && progress > 0 && (
            <div className="space-y-1">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                Загрузка: {progress}%
              </p>
            </div>
          )}
        </div>
      </div>

      {images.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Загруженные изображения</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image) => (
              <div key={image.id} className="border rounded-lg p-4">
                <img
                  src={image.url}
                  alt={image.filename}
                  className="w-full h-48 object-cover rounded-lg mb-2"
                  loading="lazy"
                />
                <p className="text-sm text-muted-foreground truncate">{image.filename}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
