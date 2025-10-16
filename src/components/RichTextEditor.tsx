import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Image as ImageIcon,
  Undo,
  Redo,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCallback } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder: 'Начните писать вашу статью...',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-gray dark:prose-invert max-w-none focus:outline-none min-h-[400px] px-4 py-3',
      },
    },
  });

  const addImage = useCallback(() => {
    const url = window.prompt('Введите URL изображения:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    icon: Icon, 
    label 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    icon: any; 
    label: string;
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={`h-9 w-9 p-0 ${isActive ? 'bg-muted' : ''}`}
      title={label}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      <div className="border-b bg-muted/30 p-2 flex flex-wrap gap-1">
        <div className="flex gap-1 border-r pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            icon={Undo}
            label="Отменить"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            icon={Redo}
            label="Повторить"
          />
        </div>

        <div className="flex gap-1 border-r pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            icon={Bold}
            label="Жирный"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            icon={Italic}
            label="Курсив"
          />
        </div>

        <div className="flex gap-1 border-r pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            icon={Heading1}
            label="Заголовок 1"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            icon={Heading2}
            label="Заголовок 2"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            icon={Heading3}
            label="Заголовок 3"
          />
        </div>

        <div className="flex gap-1 border-r pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            icon={List}
            label="Маркированный список"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            icon={ListOrdered}
            label="Нумерованный список"
          />
        </div>

        <div className="flex gap-1 border-r pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            icon={Quote}
            label="Цитата"
          />
        </div>

        <div className="flex gap-1">
          <ToolbarButton
            onClick={addImage}
            icon={ImageIcon}
            label="Добавить изображение"
          />
        </div>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
};
