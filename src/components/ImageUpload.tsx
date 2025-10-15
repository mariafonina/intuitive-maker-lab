import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2 } from "lucide-react";

export const ImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<Array<{ id: string; url: string; filename: string }>>([]);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const files = Array.from(event.target.files);
      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload file to storage
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);

        // Save metadata to database
        const { data, error: dbError } = await supabase
          .from('images')
          .insert({
            filename: file.name,
            storage_path: filePath,
            url: publicUrl
          })
          .select()
          .single();

        if (dbError) throw dbError;

        return { id: data.id, url: publicUrl, filename: file.name };
      });

      const uploadedImages = await Promise.all(uploadPromises);
      setImages([...images, ...uploadedImages]);
      
      toast({
        title: "Успешно загружено!",
        description: `${files.length} изображени${files.length === 1 ? 'е' : files.length < 5 ? 'я' : 'й'} добавлено в базу данных`,
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить изображения",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (event.target) {
        event.target.value = '';
      }
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

  useState(() => {
    loadImages();
  });

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Загрузить изображение</h2>
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
