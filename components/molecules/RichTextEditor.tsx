'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Image from '@tiptap/extension-image';
import { useEffect, useState, useRef } from 'react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Quote,
  Link as LinkIcon,
  Unlink,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  RemoveFormatting,
  ImagePlus,
  Code,
  Palette,
  Highlighter,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  minHeight?: string;
}

const TEXT_COLORS = [
  '#000000', '#434343', '#666666', '#999999',
  '#B80000', '#DB3E00', '#FCCB00', '#008B02',
  '#006B76', '#1273DE', '#004DCF', '#5300EB',
  '#EB144C', '#FF6900', '#FCB900', '#7BDCB5',
  '#00D084', '#8ED1FC', '#0693E3', '#ABB8C3',
];

const HIGHLIGHT_COLORS = [
  '#FFEAA7', '#FDCB6E', '#F8C291', '#E77F67',
  '#55E6C1', '#7BED9F', '#74B9FF', '#A29BFE',
  '#FD79A8', '#FDCB6E', '#DFE6E9', '#FFFFFF',
];

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Rédigez votre contenu...',
  label,
  error,
  minHeight = '300px',
}: RichTextEditorProps) {
  const [showSource, setShowSource] = useState(false);
  const [sourceCode, setSourceCode] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const highlightPickerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto mx-auto',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary-600 underline',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none p-4 focus:outline-none min-h-[300px]',
        style: `min-height: ${minHeight}`,
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  // Close color pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setShowColorPicker(false);
      }
      if (highlightPickerRef.current && !highlightPickerRef.current.contains(e.target as Node)) {
        setShowHighlightPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addLink = () => {
    if (!editor) return;
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const url = prompt('Entrez l\'URL du lien:');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  const removeLink = () => {
    if (editor) {
      editor.chain().focus().unsetLink().run();
    }
  };

  const addImage = () => {
    if (!editor) return;
    const url = prompt('Entrez l\'URL de l\'image:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const toggleSource = () => {
    if (!editor) return;
    if (!showSource) {
      setSourceCode(editor.getHTML());
    } else {
      editor.commands.setContent(sourceCode);
      onChange(sourceCode);
    }
    setShowSource(!showSource);
  };

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({
    onClick,
    isActive = false,
    disabled = false,
    title,
    children,
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      disabled={disabled}
      className={cn(
        'rounded p-1.5 transition-colors',
        isActive
          ? 'bg-primary-100 text-primary-700'
          : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      title={title}
    >
      {children}
    </button>
  );

  const Divider = () => <div className="mx-1 h-6 w-px bg-gray-300" />;

  const ColorPickerPopup = ({ colors, onSelect, onClose, innerRef }: {
    colors: string[];
    onSelect: (color: string) => void;
    onClose: () => void;
    innerRef: React.RefObject<HTMLDivElement | null>;
  }) => (
    <div ref={innerRef} className="absolute top-full left-0 mt-1 z-50 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
      <div className="grid grid-cols-4 gap-1">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(color);
              onClose();
            }}
            className="h-6 w-6 rounded border border-gray-300 hover:scale-110 transition-transform"
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {label && (
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div
        className={cn(
          'rounded-lg border bg-white',
          error ? 'border-error-500' : 'border-gray-300',
          'focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500'
        )}
      >
        {/* Toolbar - Row 1 */}
        <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 p-2 rounded-t-lg">
          {/* Bold, Italic, Underline, Strikethrough */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Gras (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italique (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="Souligné (Ctrl+U)"
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Barré"
          >
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>

          <Divider />

          {/* Headings */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Titre 1"
          >
            <Heading1 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title="Titre 2"
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>

          <Divider />

          {/* Link / Unlink */}
          <ToolbarButton
            onClick={addLink}
            isActive={editor.isActive('link')}
            title="Insérer un lien"
          >
            <LinkIcon className="h-4 w-4" />
          </ToolbarButton>
          {editor.isActive('link') && (
            <ToolbarButton
              onClick={removeLink}
              title="Retirer le lien"
            >
              <Unlink className="h-4 w-4" />
            </ToolbarButton>
          )}

          <Divider />

          {/* Text Color */}
          <div className="relative" ref={colorPickerRef}>
            <ToolbarButton
              onClick={() => { setShowColorPicker(!showColorPicker); setShowHighlightPicker(false); }}
              title="Couleur du texte"
            >
              <Palette className="h-4 w-4" />
            </ToolbarButton>
            {showColorPicker && (
              <ColorPickerPopup
                colors={TEXT_COLORS}
                onSelect={(color) => editor.chain().focus().setColor(color).run()}
                onClose={() => setShowColorPicker(false)}
                innerRef={colorPickerRef}
              />
            )}
          </div>

          {/* Highlight Color */}
          <div className="relative" ref={highlightPickerRef}>
            <ToolbarButton
              onClick={() => { setShowHighlightPicker(!showHighlightPicker); setShowColorPicker(false); }}
              isActive={editor.isActive('highlight')}
              title="Surligner"
            >
              <Highlighter className="h-4 w-4" />
            </ToolbarButton>
            {showHighlightPicker && (
              <ColorPickerPopup
                colors={HIGHLIGHT_COLORS}
                onSelect={(color) => editor.chain().focus().toggleHighlight({ color }).run()}
                onClose={() => setShowHighlightPicker(false)}
                innerRef={highlightPickerRef}
              />
            )}
          </div>

          <Divider />

          {/* Alignment */}
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            title="Aligner à gauche"
          >
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            title="Centrer"
          >
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            title="Aligner à droite"
          >
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            isActive={editor.isActive({ textAlign: 'justify' })}
            title="Justifier"
          >
            <AlignJustify className="h-4 w-4" />
          </ToolbarButton>

          <Divider />

          {/* Lists & Quote */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Liste à puces"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Liste numérotée"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Citation"
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>

          <Divider />

          {/* Subscript / Superscript */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            isActive={editor.isActive('subscript')}
            title="Indice"
          >
            <SubscriptIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            isActive={editor.isActive('superscript')}
            title="Exposant"
          >
            <SuperscriptIcon className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Toolbar - Row 2 */}
        <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 px-2 py-1.5">
          {/* Clear formatting */}
          <ToolbarButton
            onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
            title="Effacer le formatage"
          >
            <RemoveFormatting className="h-4 w-4" />
          </ToolbarButton>

          {/* Insert Image */}
          <ToolbarButton
            onClick={addImage}
            title="Insérer une image"
          >
            <ImagePlus className="h-4 w-4" />
          </ToolbarButton>

          {/* Source / HTML */}
          <ToolbarButton
            onClick={toggleSource}
            isActive={showSource}
            title="Code source (HTML)"
          >
            <Code className="h-4 w-4" />
          </ToolbarButton>

          <Divider />

          {/* Undo / Redo */}
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Annuler (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Rétablir (Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Editor or Source */}
        {showSource ? (
          <textarea
            value={sourceCode}
            onChange={(e) => setSourceCode(e.target.value)}
            className="w-full p-4 font-mono text-sm text-gray-800 bg-gray-50 focus:outline-none"
            style={{ minHeight }}
          />
        ) : (
          <EditorContent editor={editor} />
        )}
      </div>

      {error && <p className="mt-1 text-sm text-error-500">{error}</p>}

      <style jsx global>{`
        .ProseMirror {
          min-height: ${minHeight};
          padding: 1rem;
        }
        .ProseMirror:focus {
          outline: none;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          float: left;
          height: 0;
        }
        .ProseMirror > * + * {
          margin-top: 0.75em;
        }
        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 700;
          line-height: 1.3;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
          color: #111827;
        }
        .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 600;
          line-height: 1.4;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          color: #1f2937;
        }
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .ProseMirror li {
          margin: 0.25rem 0;
        }
        .ProseMirror li p {
          margin: 0;
        }
        .ProseMirror blockquote {
          border-left: 3px solid #6366f1;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #6b7280;
          background-color: #f9fafb;
          padding: 0.75rem 1rem;
          border-radius: 0 0.375rem 0.375rem 0;
        }
        .ProseMirror strong {
          font-weight: 700;
        }
        .ProseMirror em {
          font-style: italic;
        }
        .ProseMirror u {
          text-decoration: underline;
        }
        .ProseMirror s {
          text-decoration: line-through;
        }
        .ProseMirror a {
          color: #4f46e5;
          text-decoration: underline;
        }
        .ProseMirror p {
          margin: 0.5rem 0;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem auto;
          display: block;
        }
        .ProseMirror sub {
          font-size: 0.75em;
          vertical-align: sub;
        }
        .ProseMirror sup {
          font-size: 0.75em;
          vertical-align: super;
        }
        .ProseMirror mark {
          border-radius: 0.125rem;
          padding: 0.125rem 0;
        }
      `}</style>
    </div>
  );
}
