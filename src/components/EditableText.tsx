import { useState, useEffect } from "react";
import { Edit2 } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { supabase } from "@/integrations/supabase/client";

interface EditableTextProps {
  storageKey: string;
  defaultContent?: string;
  placeholder?: string;
  className?: string;
}

export const EditableText = ({
  storageKey,
  defaultContent = "",
  placeholder = "Добавить текст...",
  className = "",
}: EditableTextProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState<string>(defaultContent);
  const [editContent, setEditContent] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  useEffect(() => {
    loadContentFromDB();
  }, [storageKey]);

  const checkAdminStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsAdmin(false);
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      setIsAdmin(!!roles);
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    }
  };

  const loadContentFromDB = async () => {
    try {
      const { data, error } = await supabase
        .from("site_texts")
        .select("*")
        .eq("storage_key", storageKey)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading text:", error);
      }

      if (data) {
        setContent(data.content);
      } else {
        setContent(defaultContent);
      }
    } catch (error) {
      console.error("Error loading text:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await supabase
        .from("site_texts")
        .upsert(
          [
            {
              storage_key: storageKey,
              content: editContent,
            },
          ],
          { onConflict: "storage_key" }
        );

      setContent(editContent);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving text:", error);
    }
  };

  const handleEdit = () => {
    setEditContent(content);
    setIsEditing(true);
  };

  const insertFormatting = (prefix: string, suffix: string = "") => {
    const textarea = document.querySelector("textarea");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editContent.substring(start, end);
    const newText =
      editContent.substring(0, start) +
      prefix +
      selectedText +
      suffix +
      editContent.substring(end);

    setEditContent(newText);
  };

  const renderContent = () => {
    if (!content) return null;

    // Simple markdown-like rendering: **bold** and > quote
    const lines = content.split("\n");
    return lines.map((line, index) => {
      // Check if line is a quote
      if (line.trim().startsWith(">")) {
        const quoteText = line.trim().substring(1).trim();
        return (
          <blockquote
            key={index}
            className="border-l-4 border-primary pl-4 sm:pl-6 italic text-base sm:text-lg text-muted-foreground my-4"
          >
            {renderBoldText(quoteText)}
          </blockquote>
        );
      }

      // Regular paragraph
      if (line.trim()) {
        return (
          <p
            key={index}
            className="text-base sm:text-lg leading-relaxed text-muted-foreground mb-4"
          >
            {renderBoldText(line)}
          </p>
        );
      }

      return <br key={index} />;
    });
  };

  const renderBoldText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const boldText = part.slice(2, -2);
        return <strong key={index}>{boldText}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  if (isLoading) {
    return null;
  }

  // Non-admins see static content
  if (!isAdmin) {
    return <div className={className}>{renderContent()}</div>;
  }

  // Admin editing mode
  if (isEditing) {
    return (
      <div className={className}>
        <div className="space-y-4 p-4 border-2 border-primary/30 rounded-2xl bg-muted/30">
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => insertFormatting("**", "**")}
              type="button"
            >
              Полужирный
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => insertFormatting("> ", "")}
              type="button"
            >
              Цитата
            </Button>
          </div>
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder={placeholder}
            className="min-h-[200px] font-mono text-sm"
          />
          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              <strong>**текст**</strong> - полужирный
            </p>
            <p>
              <strong>&gt; текст</strong> - цитата (в начале строки)
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} size="sm">
              Сохранить
            </Button>
            <Button
              onClick={() => setIsEditing(false)}
              variant="outline"
              size="sm"
            >
              Отмена
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Admin view mode
  return (
    <div className={`relative group ${className}`}>
      {content ? (
        <>
          {renderContent()}
          {isAdmin && (
            <Button
              onClick={handleEdit}
              size="sm"
              variant="outline"
              className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Редактировать
            </Button>
          )}
        </>
      ) : (
        <div
          onClick={handleEdit}
          className="border-2 border-dashed border-muted-foreground/30 rounded-2xl p-8 cursor-pointer hover:border-primary hover:bg-muted/50 transition-all"
        >
          <div className="flex items-center justify-center gap-3">
            <Edit2 className="w-6 h-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground font-medium">
              {placeholder}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
