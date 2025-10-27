import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import { Mark, mergeAttributes, Node } from '@tiptap/core';
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
  Sparkles,
  Code,
  Brackets,
  FileCode,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCallback, useEffect, useState } from 'react';
import { ImageGalleryDialog } from './ImageGalleryDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

// Declare module to extend TipTap commands
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    gradientText: {
      toggleGradient: () => ReturnType;
    };
    rawHTML: {
      insertRawHTML: (html: string) => ReturnType;
    };
  }
}

// Custom gradient mark extension
const GradientText = Mark.create({
  name: 'gradientText',
  
  parseHTML() {
    return [
      {
        tag: 'span[class~="bg-gradient-to-r"]',
      },
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 
      class: 'bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent' 
    }), 0];
  },
  
  addCommands() {
    return {
      toggleGradient: () => ({ commands }) => {
        return commands.toggleMark(this.name);
      },
    };
  },
});

// Custom Raw HTML node extension
const RawHTML = Node.create({
  name: 'rawHTML',
  
  group: 'block',
  
  atom: true,
  
  addAttributes() {
    return {
      html: {
        default: '',
      },
    };
  },
  
  parseHTML() {
    return [
      {
        tag: 'div[data-raw-html]',
        getAttrs: (node) => {
          const div = node as HTMLElement;
          return {
            html: div.getAttribute('data-raw-html'),
          };
        },
      },
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, {
      'data-raw-html': HTMLAttributes.html,
      class: 'raw-html-block my-4',
    })];
  },
  
  addCommands() {
    return {
      insertRawHTML: (html: string) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: { html },
        });
      },
    };
  },
});

export const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isHTMLDialogOpen, setIsHTMLDialogOpen] = useState(false);
  const [htmlCode, setHtmlCode] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'code-block',
          },
        },
        code: {
          HTMLAttributes: {
            class: 'inline-code',
          },
        },
      }),
      TextStyle,
      GradientText,
      RawHTML,
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
        class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[400px] px-6 py-4',
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            event.preventDefault();
            const reader = new FileReader();
            reader.onload = (e) => {
              const base64 = e.target?.result as string;
              const { schema } = view.state;
              const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
              if (coordinates) {
                const node = schema.nodes.image.create({ src: base64 });
                const transaction = view.state.tr.insert(coordinates.pos, node);
                view.dispatch(transaction);
              }
            };
            reader.readAsDataURL(file);
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (items) {
          for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith('image/')) {
              event.preventDefault();
              const file = items[i].getAsFile();
              if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                  const base64 = e.target?.result as string;
                  editor?.chain().focus().setImage({ src: base64 }).run();
                };
                reader.readAsDataURL(file);
              }
              return true;
            }
          }
        }
        return false;
      },
    },
  });

  // Синхронизация содержимого при изменении пропса content
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const addImage = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && editor) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          editor.chain().focus().setImage({ src: base64 }).run();
        };
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
  }, [editor]);

  const handleGalleryImageSelect = useCallback((url: string) => {
    if (editor) {
      editor.chain().focus().setImage({ src: url }).run();
      setIsGalleryOpen(false);
    }
  }, [editor]);

  const handleInsertHTML = useCallback(() => {
    if (editor && htmlCode.trim()) {
      editor.chain().focus().insertRawHTML(htmlCode).run();
      setHtmlCode('');
      setIsHTMLDialogOpen(false);
    }
  }, [editor, htmlCode]);

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    icon: Icon
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    icon: any;
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={`h-9 w-9 p-0 ${isActive ? 'bg-muted' : ''}`}
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
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            icon={Redo}
          />
        </div>

        <div className="flex gap-1 border-r pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            icon={Bold}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            icon={Italic}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleGradient().run()}
            isActive={editor.isActive('gradientText')}
            icon={Sparkles}
          />
        </div>

        <div className="flex gap-1 border-r pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            icon={Heading1}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            icon={Heading2}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            icon={Heading3}
          />
        </div>

        <div className="flex gap-1 border-r pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            icon={List}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            icon={ListOrdered}
          />
        </div>

        <div className="flex gap-1 border-r pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            icon={Quote}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            icon={Code}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            icon={Brackets}
          />
        </div>

        <div className="flex gap-1">
          <ToolbarButton
            onClick={addImage}
            icon={ImageIcon}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsGalleryOpen(true)}
            className="h-9 px-3 text-xs"
          >
            Из галереи
          </Button>
          <ToolbarButton
            onClick={() => setIsHTMLDialogOpen(true)}
            icon={FileCode}
          />
        </div>
      </div>

      <EditorContent editor={editor} />
      
      <ImageGalleryDialog
        open={isGalleryOpen}
        onOpenChange={setIsGalleryOpen}
        onSelectImage={handleGalleryImageSelect}
        showSizeSelector={false}
      />

      <Dialog open={isHTMLDialogOpen} onOpenChange={setIsHTMLDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Вставить HTML код</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={htmlCode}
              onChange={(e) => setHtmlCode(e.target.value)}
              placeholder="Вставьте HTML код (например, iframe, embed и т.д.)"
              className="min-h-[200px] font-mono text-sm"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsHTMLDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleInsertHTML}>
              Вставить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
