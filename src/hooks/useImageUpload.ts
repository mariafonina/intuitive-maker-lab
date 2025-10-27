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
  maxFileSizeMB?: number;
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void;
}

export const useImageUpload = (options: UseImageUploadOptions = {}) => {
  const {
    bucket = "images",
    fileNamePrefix = "",
    saveToDatabase = false,
    maxFileSizeMB = 10, // 10MB по умолчанию
    onSuccess,
    onError,
    onProgress,
  } = options;

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const maxSizeBytes = maxFileSizeMB * 1024 * 1024;
    
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `Файл слишком большой. Максимальный размер: ${maxFileSizeMB}МБ. Размер файла: ${(file.size / 1024 / 1024).toFixed(2)}МБ`,
      };
    }

    return { valid: true };
  };

  const compressImage = async (file: File): Promise<File> => {
    // Пропускаем GIF - их сложно сжимать без потери анимации
    if (file.type === 'image/gif') {
      return file;
    }

    // Пропускаем маленькие файлы
    if (file.size < 500 * 1024) { // Меньше 500KB
      return file;
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Ограничиваем максимальный размер
          const MAX_WIDTH = 1920;
          const MAX_HEIGHT = 1920;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                
                // Используем сжатую версию только если она меньше
                if (compressedFile.size < file.size) {
                  console.log(`Сжато: ${(file.size / 1024 / 1024).toFixed(2)}МБ → ${(compressedFile.size / 1024 / 1024).toFixed(2)}МБ`);
                  resolve(compressedFile);
                } else {
                  resolve(file);
                }
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            0.85 // Качество 85%
          );
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const uploadFile = async (file: File): Promise<UploadResult> => {
    // Валидация размера
    const validation = validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Сжимаем изображение если это не GIF
    let fileToUpload = file;
    if (file.type.startsWith('image/') && file.type !== 'image/gif') {
      setProgress(10);
      onProgress?.(10);
      fileToUpload = await compressImage(file);
    }

    setProgress(30);
    onProgress?.(30);

    const fileExt = fileToUpload.name.split('.').pop();
    const fileName = fileNamePrefix 
      ? `${fileNamePrefix}-${Date.now()}.${fileExt}`
      : `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = fileName;

    // Upload file to storage
    setProgress(50);
    onProgress?.(50);
    
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileToUpload, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    setProgress(80);
    onProgress?.(80);

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

    setProgress(100);
    onProgress?.(100);

    return result;
  };

  const uploadSingle = async (file: File): Promise<UploadResult | null> => {
    try {
      setUploading(true);
      setProgress(0);
      
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
      
      // Предупреждение для больших файлов
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Загрузка большого файла",
          description: `Размер: ${fileSizeMB}МБ. Это может занять некоторое время...`,
        });
      }

      const result = await uploadFile(file);
      
      toast({
        title: "Успешно загружено!",
        description: `Изображение добавлено (${fileSizeMB}МБ)`,
      });

      onSuccess?.(result);
      return result;
    } catch (error) {
      const err = error as Error;
      toast({
        title: "Ошибка загрузки",
        description: err.message || "Не удалось загрузить изображение",
        variant: "destructive",
      });
      onError?.(err);
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const uploadMultiple = async (files: File[]): Promise<UploadResult[]> => {
    try {
      setUploading(true);
      setProgress(0);
      
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
        title: "Ошибка загрузки",
        description: err.message || "Не удалось загрузить изображения",
        variant: "destructive",
      });
      onError?.(err);
      return [];
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return {
    uploading,
    progress,
    uploadSingle,
    uploadMultiple,
  };
};
