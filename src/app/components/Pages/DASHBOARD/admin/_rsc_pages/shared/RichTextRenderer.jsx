import React from 'react';
import { parseEditorContent } from './richTextContent';
import './rich-text-editor.css';

const safeUrl = (value = '', { images = false } = {}) => {
  const url = String(value || '').trim();
  if (!url) return '';

  if (url.startsWith('/') || url.startsWith('#')) return url;

  try {
    const parsed = new URL(url);
    const allowed = images ? ['http:', 'https:'] : ['http:', 'https:', 'mailto:', 'tel:'];
    return allowed.includes(parsed.protocol) ? url : '';
  } catch {
    return '';
  }
};

const renderMarks = (children, marks = [], keyPrefix = 'mark') =>
  marks.reduce((current, mark, index) => {
    const key = `${keyPrefix}-${index}`;

    if (mark.type === 'bold') return <strong key={key}>{current}</strong>;
    if (mark.type === 'italic') return <em key={key}>{current}</em>;
    if (mark.type === 'strike') return <s key={key}>{current}</s>;
    if (mark.type === 'code') return <code key={key}>{current}</code>;
    if (mark.type === 'link') {
      const href = safeUrl(mark.attrs?.href);
      if (!href) return current;

      return (
        <a key={key} href={href} target="_blank" rel="noopener noreferrer nofollow">
          {current}
        </a>
      );
    }

    return current;
  }, children);

const renderChildren = (nodes = [], keyPrefix = 'node') => nodes.map((node, index) => renderNode(node, `${keyPrefix}-${index}`)).filter(Boolean);

const renderNode = (node, key) => {
  if (!node) return null;

  if (node.type === 'text') {
    return renderMarks(node.text || '', node.marks || [], key);
  }

  const children = renderChildren(node.content || [], key);

  if (node.type === 'paragraph') return <p key={key}>{children}</p>;
  if (node.type === 'heading') {
    const level = Number(node.attrs?.level) || 2;
    if (level === 1) return <h1 key={key}>{children}</h1>;
    if (level === 3) return <h3 key={key}>{children}</h3>;
    return <h2 key={key}>{children}</h2>;
  }
  if (node.type === 'bulletList') return <ul key={key}>{children}</ul>;
  if (node.type === 'orderedList') return <ol key={key}>{children}</ol>;
  if (node.type === 'listItem') return <li key={key}>{children}</li>;
  if (node.type === 'blockquote') return <blockquote key={key}>{children}</blockquote>;
  if (node.type === 'codeBlock') return <pre key={key}>{children}</pre>;
  if (node.type === 'hardBreak') return <br key={key} />;
  if (node.type === 'horizontalRule') return <hr key={key} />;
  if (node.type === 'image') {
    const src = safeUrl(node.attrs?.src, { images: true });
    if (!src) return null;
    return <img key={key} src={src} alt={node.attrs?.alt || ''} title={node.attrs?.title || undefined} loading="lazy" />;
  }

  if (children.length > 0) return <React.Fragment key={key}>{children}</React.Fragment>;
  return null;
};

export const RichTextRenderer = ({ content = '', className = '' }) => {
  const parsed = parseEditorContent(content);
  const nodes = typeof parsed === 'string' ? [{ type: 'paragraph', content: [{ type: 'text', text: parsed }] }] : parsed.content || [];

  return <div className={`rich-text-editor-content ${className}`}>{renderChildren(nodes, 'rich-text')}</div>;
};

export default RichTextRenderer;
