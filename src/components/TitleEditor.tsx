import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import { Mark, mergeAttributes } from "@tiptap/core";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useEffect } from "react";

const GradientText = Mark.create({
  name: "gradientText",
  
  parseHTML() {
    return [{ tag: 'span[data-gradient="true"]' }];
  },
  
  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-gradient": "true",
        class: "bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent font-bold",
      }),
      0,
    ];
  },
  
  addCommands() {
    return {
      toggleGradient: () => ({ commands }) => {
        return commands.toggleMark(this.name);
      },
    };
  },
});

interface TitleEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export const TitleEditor = ({ content, onChange, placeholder = "Введите заголовок..." }: TitleEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        hardBreak: false,
      }),
      TextStyle,
      GradientText,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "min-h-[42px] max-h-[42px] overflow-hidden px-3 py-2 rounded-md border border-input bg-background text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <Button
          type="button"
          variant={editor.isActive("gradientText") ? "default" : "outline"}
          size="sm"
          onClick={() => editor.chain().focus().toggleGradient().run()}
          title="Градиент"
        >
          <Sparkles className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">
          Выделите текст и нажмите на звездочку для градиента
        </span>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};
