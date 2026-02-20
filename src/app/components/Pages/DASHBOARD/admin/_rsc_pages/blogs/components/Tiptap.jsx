'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useIsClient } from '@/hooks/useIsClient';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Heading3, Quote, Code, Strikethrough, Link } from 'lucide-react';
import '../components/tiptap.css';

const Tiptap = ({ content = '', onChange }) => {
  const isClient = useIsClient();

  const parsedContent = typeof content === 'string' && content.startsWith('{') ? JSON.parse(content) : content;

  // Editor content styles
  const editorStyles = {
    proseMirror: 'min-h-[300px] p-4 outline-none', // base editor wrapper
  };

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
    onMount: ({ editor }) => {
      const jsonContent = JSON.stringify(editor.getJSON());
      onChange(jsonContent);
    },
    onUpdate: ({ editor }) => {
      const jsonContent = JSON.stringify(editor.getJSON());
      onChange(jsonContent);
    },
    editable: true,
    editorProps: {
      attributes: {
        class: 'focus:outline-none',
      },
    },
  });

  if (!isClient) {
    return <div className="min-h-[200px] w-full border rounded-md p-4">Loading editor...</div>;
  }

  const MenuBar = () => {
    if (!editor) {
      return null;
    }

    const getActiveClass = (isActive) => (isActive ? 'bg-gray-300 text-black' : 'hover:bg-gray-200 text-gray-700'); // get active class

    return (
      <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50 rounded-t-md">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded transition-colors ${getActiveClass(editor.isActive('bold'))}`} title="Bold">
          <Bold size={16} />
        </button>

        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded transition-colors ${getActiveClass(editor.isActive('italic'))}`} title="Italic">
          <Italic size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded transition-colors ${getActiveClass(editor.isActive('strike'))}`}
          title="Strikethrough"
        >
          <Strikethrough size={16} />
        </button>

        <button type="button" onClick={() => editor.chain().focus().toggleCode().run()} className={`p-2 rounded transition-colors ${getActiveClass(editor.isActive('code'))}`} title="Code">
          <Code size={16} />
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded transition-colors ${getActiveClass(editor.isActive('heading', { level: 1 }))}`}
          title="Heading 1"
        >
          <Heading1 size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded transition-colors ${getActiveClass(editor.isActive('heading', { level: 2 }))}`}
          title="Heading 2"
        >
          <Heading2 size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded transition-colors ${getActiveClass(editor.isActive('heading', { level: 3 }))}`}
          title="Heading 3"
        >
          <Heading3 size={16} />
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded transition-colors ${getActiveClass(editor.isActive('bulletList'))}`}
          title="Bullet List"
        >
          <List size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded transition-colors ${getActiveClass(editor.isActive('orderedList'))}`}
          title="Ordered List"
        >
          <ListOrdered size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded transition-colors ${getActiveClass(editor.isActive('blockquote'))}`}
          title="Quote"
        >
          <Quote size={16} />
        </button>
      </div>
    );
  };
  return (
    <div className="w-full border rounded-md overflow-hidden">
      <MenuBar />

      <EditorContent
        editor={editor}
        className={`
    ${editorStyles.proseMirror}
  `}
      />
    </div>
  );
};

export default Tiptap;
