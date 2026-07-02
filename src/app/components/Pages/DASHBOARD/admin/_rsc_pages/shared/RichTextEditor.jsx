'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Extension, Node, mergeAttributes } from '@tiptap/core';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  Link,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
  Unlink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createEmptyEditorDocument, parseEditorContent } from './richTextContent';
import './rich-text-editor.css';

export { createEmptyEditorDocument, parseEditorContent };

const TextAlignExtension = Extension.create({
  name: 'weelpTextAlign',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          textAlign: {
            default: null,
            parseHTML: (element) => element.style.textAlign || null,
            renderHTML: (attributes) => (attributes.textAlign ? { style: `text-align: ${attributes.textAlign}` } : {}),
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setTextAlign:
        (textAlign) =>
        ({ commands }) => {
          const paragraphUpdated = commands.updateAttributes('paragraph', { textAlign });
          const headingUpdated = commands.updateAttributes('heading', { textAlign });
          return paragraphUpdated || headingUpdated;
        },
      unsetTextAlign:
        () =>
        ({ commands }) => {
          const paragraphUpdated = commands.resetAttributes('paragraph', 'textAlign');
          const headingUpdated = commands.resetAttributes('heading', 'textAlign');
          return paragraphUpdated || headingUpdated;
        },
    };
  },
});

const TableNode = Node.create({
  name: 'table',
  group: 'block',
  content: 'tableRow+',
  isolating: true,

  parseHTML() {
    return [{ tag: 'table' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['table', mergeAttributes(HTMLAttributes, { class: 'rich-text-editor-table' }), ['tbody', 0]];
  },
});

const TableRowNode = Node.create({
  name: 'tableRow',
  content: '(tableCell | tableHeader)*',

  parseHTML() {
    return [{ tag: 'tr' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['tr', HTMLAttributes, 0];
  },
});

const TableCellNode = Node.create({
  name: 'tableCell',
  content: 'block+',
  tableRole: 'cell',
  isolating: true,

  parseHTML() {
    return [{ tag: 'td' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['td', HTMLAttributes, 0];
  },
});

const TableHeaderNode = Node.create({
  name: 'tableHeader',
  content: 'block+',
  tableRole: 'header_cell',
  isolating: true,

  parseHTML() {
    return [{ tag: 'th' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['th', HTMLAttributes, 0];
  },
});

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
  TableNode,
  TableRowNode,
  TableHeaderNode,
  TableCellNode,
  TextAlignExtension,
];

const ToolbarButton = ({ active = false, label, children, onClick, disabled = false }) => (
  <Button
    type="button"
    variant="ghost"
    size="icon"
    aria-label={label}
    aria-pressed={active}
    title={label}
    disabled={disabled}
    onMouseDown={(event) => event.preventDefault()}
    onClick={onClick}
    className={`h-9 w-9 rounded-md ${active ? 'bg-muted text-foreground shadow-sm ring-1 ring-border' : 'text-foreground hover:bg-muted'}`}
  >
    {children}
  </Button>
);

const textNode = (text) => (text ? [{ type: 'text', text }] : undefined);

const textBlockNode = (type, text, attrs) => ({
  type,
  ...(attrs ? { attrs } : {}),
  ...(textNode(text) ? { content: textNode(text) } : {}),
});

const textBlockNodeSize = (text = '') => text.length + 2;

export const getPartialSelectionTextRange = ({ blockFrom, beforeText = '', selectedText = '' }) => {
  const selectedTextStart = blockFrom + (beforeText ? textBlockNodeSize(beforeText) : 0) + 1;
  return { from: selectedTextStart, to: selectedTextStart + selectedText.length };
};

export const buildPartialHeadingBlocks = ({ beforeText = '', selectedText = '', afterText = '', level, selectedIsActiveHeading = false }) => {
  const surroundingBlockType = selectedIsActiveHeading ? 'heading' : 'paragraph';
  const surroundingAttrs = selectedIsActiveHeading ? { level } : undefined;
  const selectedBlock = selectedIsActiveHeading ? textBlockNode('paragraph', selectedText) : textBlockNode('heading', selectedText, { level });

  return [
    beforeText ? textBlockNode(surroundingBlockType, beforeText, surroundingAttrs) : null,
    selectedBlock,
    afterText ? textBlockNode(surroundingBlockType, afterText, surroundingAttrs) : null,
  ].filter(Boolean);
};

export const buildPartialTextAlignBlocks = ({ beforeText = '', selectedText = '', afterText = '', textAlign }) =>
  [
    beforeText ? textBlockNode('paragraph', beforeText) : null,
    textBlockNode('paragraph', selectedText, textAlign === 'left' ? undefined : { textAlign }),
    afterText ? textBlockNode('paragraph', afterText) : null,
  ].filter(Boolean);

const applyPartialSelectionTransform = (editor, buildReplacement) => {
  const { doc, selection } = editor.state;
  const { empty, from, to, $from, $to } = selection;

  if (empty || !$from.sameParent($to) || !$from.parent.isTextblock) return false;

  const blockFrom = $from.before();
  const blockTo = $from.after();
  const contentFrom = $from.start();
  const contentTo = $from.end();
  const selectedText = doc.textBetween(from, to, '\n', '\n');

  if (!selectedText.trim()) return false;

  const beforeText = doc.textBetween(contentFrom, from, '\n', '\n');
  const afterText = doc.textBetween(to, contentTo, '\n', '\n');
  const replacement = buildReplacement({ beforeText, selectedText, afterText });
  const textRange = getPartialSelectionTextRange({ blockFrom, beforeText, selectedText });

  return editor.chain().focus().insertContentAt({ from: blockFrom, to: blockTo }, replacement).setTextSelection(textRange).run();
};

const applyPartialSelectionHeading = (editor, level, selectedIsActiveHeading) =>
  applyPartialSelectionTransform(editor, ({ beforeText, selectedText, afterText }) => buildPartialHeadingBlocks({ beforeText, selectedText, afterText, level, selectedIsActiveHeading }));

const applyPartialSelectionTextAlign = (editor, textAlign) =>
  applyPartialSelectionTransform(editor, ({ beforeText, selectedText, afterText }) => buildPartialTextAlignBlocks({ beforeText, selectedText, afterText, textAlign }));

export const RichTextEditor = ({ content = '', onChange, editable = true, mediaPicker, chrome = true }) => {
  const [mediaOpen, setMediaOpen] = useState(false);
  const [, setEditorStateVersion] = useState(0);
  const parsedContent = useMemo(() => parseEditorContent(content), [content]);

  const editor = useEditor({
    extensions: editorExtensions,
    content: parsedContent,
    immediatelyRender: false,
    editable,
    onUpdate: ({ editor: activeEditor }) => {
      onChange?.(JSON.stringify(activeEditor.getJSON()));
    },
    onSelectionUpdate: () => {
      setEditorStateVersion((version) => version + 1);
    },
    onTransaction: () => {
      setEditorStateVersion((version) => version + 1);
    },
    editorProps: {
      attributes: {
        class: 'rich-text-editor-content focus:outline-none p-[10px] outline-none max-w-full overflow-x-hidden',
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

  useEffect(() => {
    if (!editor) return;

    const refreshToolbarState = () => setEditorStateVersion((version) => version + 1);
    const refreshOnDocumentSelection = () => {
      const selection = window.getSelection();
      const anchorNode = selection?.anchorNode;
      if (anchorNode && editor.view.dom.contains(anchorNode.nodeType === Node.ELEMENT_NODE ? anchorNode : anchorNode.parentNode)) {
        window.requestAnimationFrame(refreshToolbarState);
      }
    };

    editor.on('selectionUpdate', refreshToolbarState);
    editor.on('transaction', refreshToolbarState);
    document.addEventListener('selectionchange', refreshOnDocumentSelection);

    return () => {
      editor.off('selectionUpdate', refreshToolbarState);
      editor.off('transaction', refreshToolbarState);
      document.removeEventListener('selectionchange', refreshOnDocumentSelection);
    };
  }, [editor]);

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

  const handleHeading = (level) => {
    if (!editor) return;

    const selectedIsActiveHeading = editor.isActive('heading', { level });
    const changed = applyPartialSelectionHeading(editor, level, selectedIsActiveHeading) || editor.chain().focus().toggleHeading({ level }).run();
    if (changed) emitChange();
  };

  const handleTextAlign = (textAlign) => {
    if (!editor) return;

    const changed = applyPartialSelectionTextAlign(editor, textAlign);
    if (changed) {
      emitChange();
      return;
    }

    if (textAlign === 'left') {
      editor.chain().focus().unsetTextAlign().run();
    } else {
      editor.chain().focus().setTextAlign(textAlign).run();
    }
    emitChange();
  };

  if (!editor) {
    return <div className={chrome ? 'min-h-[180px] w-full rounded-md border border-border p-4' : 'min-h-[120px] w-full'}>Loading editor...</div>;
  }

  const isTextAlignActive = (textAlign) => editor.isActive('paragraph', { textAlign }) || editor.isActive('heading', { textAlign }) || editor.isActive({ textAlign });
  const isDefaultAlignActive = !isTextAlignActive('center') && !isTextAlignActive('right');

  return (
    <div className={chrome ? 'overflow-hidden rounded-md border border-border bg-background' : 'w-full'}>
      {editable && (
        <div className="flex flex-wrap gap-1 border-b border-border bg-muted p-2">
          <ToolbarButton
            label="Undo"
            disabled={!editor.can().undo()}
            onClick={() => {
              editor.chain().focus().undo().run();
              emitChange();
            }}
          >
            <Undo2 size={16} />
          </ToolbarButton>
          <ToolbarButton
            label="Redo"
            disabled={!editor.can().redo()}
            onClick={() => {
              editor.chain().focus().redo().run();
              emitChange();
            }}
          >
            <Redo2 size={16} />
          </ToolbarButton>
          <ToolbarButton
            label="Paragraph"
            active={editor.isActive('paragraph')}
            onClick={() => {
              editor.chain().focus().setParagraph().run();
              emitChange();
            }}
          >
            <Pilcrow size={16} />
          </ToolbarButton>
          <ToolbarButton label="Align left" active={isDefaultAlignActive} onClick={() => handleTextAlign('left')}>
            <AlignLeft size={16} />
          </ToolbarButton>
          <ToolbarButton label="Align center" active={isTextAlignActive('center')} onClick={() => handleTextAlign('center')}>
            <AlignCenter size={16} />
          </ToolbarButton>
          <ToolbarButton label="Align right" active={isTextAlignActive('right')} onClick={() => handleTextAlign('right')}>
            <AlignRight size={16} />
          </ToolbarButton>
          <ToolbarButton label="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
            <Bold size={16} />
          </ToolbarButton>
          <ToolbarButton label="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
            <Italic size={16} />
          </ToolbarButton>
          <ToolbarButton label="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
            <Strikethrough size={16} />
          </ToolbarButton>
          <ToolbarButton label="Heading 1" active={editor.isActive('heading', { level: 1 })} onClick={() => handleHeading(1)}>
            <Heading1 size={16} />
          </ToolbarButton>
          <ToolbarButton label="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => handleHeading(2)}>
            <Heading2 size={16} />
          </ToolbarButton>
          <ToolbarButton label="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => handleHeading(3)}>
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
          <ToolbarButton
            label="Horizontal rule"
            onClick={() => {
              editor.chain().focus().setHorizontalRule().run();
              emitChange();
            }}
          >
            <Minus size={16} />
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
