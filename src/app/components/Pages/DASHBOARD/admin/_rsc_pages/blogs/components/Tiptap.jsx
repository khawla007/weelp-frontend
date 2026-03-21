'use client';

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useIsClient } from '@/hooks/useIsClient';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Heading3, Quote, Code, Strikethrough, Link } from 'lucide-react';
import '../components/tiptap.css';

const Tiptap = ({ content = '', onChange }) => {
  const isClient = useIsClient();

  const parsedContent = typeof content === 'string' && content.startsWith('{') ? JSON.parse(content) : content;

  // intialize editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
    ],
    content: parsedContent,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const jsonContent = JSON.stringify(editor.getJSON());
      onChange(jsonContent);
    },
    editable: true,
    editorProps: {
      attributes: {
        class: 'focus:outline-none px-4 py-3 outline-none max-w-full overflow-x-hidden',
      },
    },
  });

  // Call onChange with initial content when editor mounts
  useEffect(() => {
    if (editor && onChange) {
      const jsonContent = JSON.stringify(editor.getJSON());
      onChange(jsonContent);
    }
  }, [editor]);

  if (!isClient || !editor) {
    return <div className="h-[150px] w-full border rounded-md p-4">Loading editor...</div>;
  }

  return (
    <div className="border rounded-md overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 p-2 border-b bg-gray-50">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}>
          <Bold size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}>
          <Italic size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-2 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}`}>
          <Heading1 size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}>
          <Heading2 size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`p-2 rounded ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}`}>
          <Heading3 size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}>
          <List size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-2 rounded ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}>
          <ListOrdered size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`p-2 rounded ${editor.isActive('blockquote') ? 'bg-gray-200' : ''}`}>
          <Quote size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleCode().run()} className={`p-2 rounded ${editor.isActive('code') ? 'bg-gray-200' : ''}`}>
          <Code size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={`p-2 rounded ${editor.isActive('strike') ? 'bg-gray-200' : ''}`}>
          <Strikethrough size={16} />
        </button>
      </div>

      {/* Editor Content */}
      <div className="w-full overflow-x-hidden">
        <EditorContent editor={editor} className="min-h-[150px]" />
      </div>
    </div>
  );
};

export default Tiptap;
