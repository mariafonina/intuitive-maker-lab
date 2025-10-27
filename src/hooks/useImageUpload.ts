import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UploadResult {
  url: string;
  filename: string;
  id?: string;
}

interface UseImageUploadOptions {
  bucket?: string;
  fileNamePrefix?: string;
  saveToDatabase?: boolean;
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: Error) => void;
}

export const useImageUpload = (options: UseImageUploadOptions = {}) => {
  const {
    bucket = "images",
    fileNamePrefix = "",
    saveToDatabase = false,
    onSuccess,
    onError,
  } = options;

  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadFile = async (file: File): Promise<UploadResult> => {
    const fileExt = file.name.split('.').pop();
    const fileName = fileNamePrefix 
      ? `${fileNamePrefix}-${Date.now()}.${fileExt}`
      : `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = fileName;

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    const result: UploadResult = {
      url: publicUrl,
      filename: file.name,
    };

    // Save metadata to database if needed
    if (saveToDatabase) {
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
      result.id = data.id;
    }

    return result;
  };

  const uploadSingle = async (file: File): Promise<UploadResult | null> => {
    try {
      setUploading(true);
      const result = await uploadFile(file);
      
      toast({
        title: "Успешно загружено!",
        description: "Изображение добавлено",
      });

      onSuccess?.(result);
      return result;
    } catch (error) {
      const err = error as Error;
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить изображение",
        variant: "destructive",
      });
      onError?.(err);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const uploadMultiple = async (files: File[]): Promise<UploadResult[]> => {
    try {
      setUploading(true);
      const uploadPromises = files.map(file => uploadFile(file));
      const results = await Promise.all(uploadPromises);
      
      toast({
        title: "Успешно загружено!",
        description: `${files.length} изображени${files.length === 1 ? 'е' : files.length < 5 ? 'я' : 'й'} добавлено`,
      });

      return results;
    } catch (error) {
      const err = error as Error;
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить изображения",
        variant: "destructive",
      });
      onError?.(err);
      return [];
    } finally {
      setUploading(false);
    }
  };

  return {
    uploading,
    uploadSingle,
    uploadMultiple,
  };
};
