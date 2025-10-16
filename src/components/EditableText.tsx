import { useState, useEffect } from "react";
import { Edit2 } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/contexts/AdminContext";

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
  const [isContentLoading, setIsContentLoading] = useState(true);
  const { isAdmin, isLoading: isAdminLoading } = useAdmin();

  useEffect(() => {
    loadContentFromDB();
  }, [storageKey]);

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
      setIsContentLoading(false);
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
    
    // Set focus back and adjust cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selectedText.length + suffix.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const renderContent = () => {
    if (!content) return null;

    const lines = content.split("\n");
    const elements: JSX.Element[] = [];
    let orderedListItems: string[] = [];
    let listStartIndex = -1;

    const flushOrderedList = (currentIndex: number) => {
      if (orderedListItems.length > 0) {
        elements.push(
          <ol key={`ol-${listStartIndex}`} className="space-y-2 mb-6 list-decimal list-inside">
            {orderedListItems.map((item, idx) => (
              <li
                key={idx}
                className="text-base sm:text-lg leading-relaxed text-muted-foreground"
              >
                {renderFormattedText(item)}
              </li>
            ))}
          </ol>
        );
        orderedListItems = [];
        listStartIndex = -1;
      }
    };

    lines.forEach((line, index) => {
      // Check if line is a quote
      if (line.trim().startsWith(">")) {
        flushOrderedList(index);
        const quoteText = line.trim().substring(1).trim();
        elements.push(
          <blockquote
            key={index}
            className="border-l-4 border-primary pl-4 sm:pl-6 italic text-base sm:text-lg text-muted-foreground my-4"
          >
            {renderFormattedText(quoteText)}
          </blockquote>
        );
        return;
      }

      // Check if line is an ordered list item (1. text)
      const orderedListMatch = line.trim().match(/^(\d+)\.\s+(.+)$/);
      if (orderedListMatch) {
        if (listStartIndex === -1) listStartIndex = index;
        orderedListItems.push(orderedListMatch[2]);
        return;
      }

      // If we were building a list and hit a non-list line, flush the list
      if (orderedListItems.length > 0) {
        flushOrderedList(index);
      }

      // Regular paragraph
      if (line.trim()) {
        elements.push(
          <p
            key={index}
            className="text-base sm:text-lg leading-relaxed text-muted-foreground mb-4"
          >
            {renderFormattedText(line)}
          </p>
        );
      } else {
        elements.push(<br key={index} />);
      }
    });

    // Flush any remaining list items
    flushOrderedList(lines.length);

    return elements;
  };

  const renderFormattedText = (text: string) => {
    // Split by both bold (**text**) and italic (*text*)
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    
    return parts.map((part, index) => {
      // Bold text
      if (part.startsWith("**") && part.endsWith("**")) {
        const boldText = part.slice(2, -2);
        return <strong key={index}>{boldText}</strong>;
      }
      // Italic text (but not bold)
      if (part.startsWith("*") && part.endsWith("*") && !part.startsWith("**")) {
        const italicText = part.slice(1, -1);
        return <em key={index}>{italicText}</em>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  if (isAdminLoading || isContentLoading) {
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
              onClick={() => insertFormatting("*", "*")}
              type="button"
            >
              Курсив
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => insertFormatting("> ", "")}
              type="button"
            >
              Цитата
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const textarea = document.querySelector("textarea");
                if (!textarea) return;
                const start = textarea.selectionStart;
                const lines = editContent.substring(0, start).split("\n");
                const currentLineStart = editContent.lastIndexOf("\n", start - 1) + 1;
                const prefix = currentLineStart === 0 ? "1. " : "\n1. ";
                insertFormatting(prefix, "");
              }}
              type="button"
            >
              Нумерованный список
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
              <strong>*текст*</strong> - курсив
            </p>
            <p>
              <strong>&gt; текст</strong> - цитата (в начале строки)
            </p>
            <p>
              <strong>1. текст</strong> - нумерованный список
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
