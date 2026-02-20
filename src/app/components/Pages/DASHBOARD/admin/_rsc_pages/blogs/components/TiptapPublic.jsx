'use client';

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useIsClient } from '@/hooks/useIsClient';
import '../components/tiptap.css';

export const TiptapPublic = ({ content = '' }) => {
  const isClient = useIsClient();

  // Parse content if it's a JSON string, otherwise use as-is
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
    editable: false,
    editorProps: {
      attributes: {
        class: 'focus:outline-none',
      },
    },
  });

  // Sync editor when content prop changes
  useEffect(() => {
    if (editor && parsedContent) {
      // Check if content is different before updating
      const currentContent = editor.getJSON();
      if (JSON.stringify(currentContent) !== JSON.stringify(parsedContent)) {
        editor.commands.setContent(parsedContent);
      }
    }
  }, [parsedContent, editor]);

  if (!isClient) {
    return <div className="min-h-[200px] w-full border rounded-md p-4">Loading editor...</div>;
  }

  return (
    <EditorContent
      editor={editor}
      className={`
    ${editorStyles.proseMirror}
  `}
    />
  );
};
