import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, Loader2, X, AlertCircle } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ArticleImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export const ArticleImageUpload: React.FC<ArticleImageUploadProps> = ({ 
  value, 
  onChange,
  label = "Изображение для соцсетей" 
}) => {
  const { uploading, progress, uploadSingle } = useImageUpload({
    fileNamePrefix: "article",
    maxFileSizeMB: 10,
    onSuccess: (result) => onChange(result.url),
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    await uploadSingle(file);
    
    if (event.target) {
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-xs">
          Максимальный размер: 10МБ. Рекомендуем оптимизировать GIF перед загрузкой на{" "}
          <a 
            href="https://ezgif.com/optimize" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline"
          >
            ezgif.com
          </a>
        </AlertDescription>
      </Alert>
      
      <div className="flex gap-2">
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/image.jpg или загрузите файл"
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => document.getElementById('article-image-upload')?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        </Button>
        {value && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onChange("")}
            disabled={uploading}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {uploading && progress > 0 && (
        <div className="space-y-1">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            Загрузка: {progress}%
          </p>
        </div>
      )}
      
      <Input
        id="article-image-upload"
        type="file"
        accept="image/*,.gif"
        onChange={handleFileUpload}
        disabled={uploading}
        className="hidden"
      />
      
      {value && (
        <div className="mt-2 border rounded-lg p-2">
          <img
            src={value}
            alt="Preview"
            className="w-full max-h-48 object-contain rounded"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
};
