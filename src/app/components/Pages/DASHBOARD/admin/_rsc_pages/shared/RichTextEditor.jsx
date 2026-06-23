'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import { Bold, Code, Heading1, Heading2, Heading3, ImageIcon, Italic, Link, List, ListOrdered, Quote, Strikethrough, Unlink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createEmptyEditorDocument, parseEditorContent } from './richTextContent';
import './rich-text-editor.css';

export { createEmptyEditorDocument, parseEditorContent };

const editorExtensions = [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3],
    },
    link: false,
  }),
  Image.configure({
    allowBase64: false,
    HTMLAttributes: {
      class: 'rich-text-editor-image',
    },
  }),
  LinkExtension.configure({
    openOnClick: false,
    autolink: true,
    linkOnPaste: true,
    HTMLAttributes: {
      class: 'rich-text-editor-link',
      rel: 'noopener noreferrer nofollow',
      target: '_blank',
    },
  }),
];

const ToolbarButton = ({ active = false, label, children, onClick, disabled = false }) => (
  <Button
    type="button"
    variant="ghost"
    size="icon"
    aria-label={label}
    title={label}
    disabled={disabled}
    onClick={onClick}
    className={`h-9 w-9 rounded-md ${active ? 'bg-accent text-foreground' : 'text-foreground hover:bg-muted'}`}
  >
    {children}
  </Button>
);

export const RichTextEditor = ({ content = '', onChange, editable = true, mediaPicker, chrome = true }) => {
  const [mediaOpen, setMediaOpen] = useState(false);
  const parsedContent = useMemo(() => parseEditorContent(content), [content]);

  const editor = useEditor({
    extensions: editorExtensions,
    content: parsedContent,
    immediatelyRender: false,
    editable,
    onUpdate: ({ editor: activeEditor }) => {
      onChange?.(JSON.stringify(activeEditor.getJSON()));
    },
    editorProps: {
      attributes: {
        class: 'rich-text-editor-content focus:outline-none px-4 py-3 outline-none max-w-full overflow-x-hidden',
      },
    },
  });

  useEffect(() => {
    if (!editor) return;

    const nextContent = parseEditorContent(content);
    if (JSON.stringify(editor.getJSON()) !== JSON.stringify(nextContent)) {
      editor.commands.setContent(nextContent, false);
    }
  }, [content, editor]);

  const emitChange = () => {
    if (!editor) return;
    onChange?.(JSON.stringify(editor.getJSON()));
  };

  const handleInsertImage = (media) => {
    if (!editor || !media?.url) return;

    editor
      .chain()
      .focus()
      .setImage({
        src: media.url,
        alt: media.alt_text || media.alt || media.name || '',
        title: media.name || media.alt_text || media.alt || '',
      })
      .run();
    emitChange();
    setMediaOpen(false);
  };

  const handleLink = () => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href || '';
    const url = window.prompt('Enter URL', previousUrl);

    if (url === null) return;

    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      emitChange();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
    emitChange();
  };

  if (!editor) {
    return <div className={chrome ? 'min-h-[180px] w-full rounded-md border border-border p-4' : 'min-h-[120px] w-full'}>Loading editor...</div>;
  }

  return (
    <div className={chrome ? 'overflow-hidden rounded-md border border-border bg-background' : 'w-full'}>
      {editable && (
        <div className="flex flex-wrap gap-1 border-b border-border bg-muted p-2">
          <ToolbarButton label="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
            <Bold size={16} />
          </ToolbarButton>
          <ToolbarButton label="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
            <Italic size={16} />
          </ToolbarButton>
          <ToolbarButton label="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
            <Strikethrough size={16} />
          </ToolbarButton>
          <ToolbarButton label="Heading 1" active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
            <Heading1 size={16} />
          </ToolbarButton>
          <ToolbarButton label="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
            <Heading2 size={16} />
          </ToolbarButton>
          <ToolbarButton label="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
            <Heading3 size={16} />
          </ToolbarButton>
          <ToolbarButton label="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
            <List size={16} />
          </ToolbarButton>
          <ToolbarButton label="Ordered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
            <ListOrdered size={16} />
          </ToolbarButton>
          <ToolbarButton label="Blockquote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
            <Quote size={16} />
          </ToolbarButton>
          <ToolbarButton label="Inline code" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}>
            <Code size={16} />
          </ToolbarButton>
          <ToolbarButton label="Add link" active={editor.isActive('link')} onClick={handleLink}>
            <Link size={16} />
          </ToolbarButton>
          <ToolbarButton
            label="Remove link"
            disabled={!editor.isActive('link')}
            onClick={() => {
              editor.chain().focus().unsetLink().run();
              emitChange();
            }}
          >
            <Unlink size={16} />
          </ToolbarButton>
          <ToolbarButton label="Insert image" onClick={() => setMediaOpen(true)}>
            <ImageIcon size={16} />
          </ToolbarButton>
        </div>
      )}

      <EditorContent editor={editor} className={chrome ? 'min-h-[180px]' : ''} />

      {editable && mediaPicker && (
        <Dialog open={mediaOpen} onOpenChange={setMediaOpen}>
          <DialogContent className="max-w-screen-xl">
            <DialogHeader>
              <DialogTitle>Insert image</DialogTitle>
              <DialogDescription>Select or upload an image to insert into the editor content.</DialogDescription>
            </DialogHeader>
            {mediaPicker({ onSelect: handleInsertImage, close: () => setMediaOpen(false) })}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default RichTextEditor;
