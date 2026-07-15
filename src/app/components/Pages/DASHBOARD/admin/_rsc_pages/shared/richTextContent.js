export const createEmptyEditorDocument = () => ({
  type: 'doc',
  content: [{ type: 'paragraph' }],
});

export const parseEditorContent = (content = '') => {
  if (!content) return createEmptyEditorDocument();

  if (typeof content === 'object') return content;

  if (typeof content !== 'string') return createEmptyEditorDocument();

  const trimmed = content.trim();
  if (!trimmed) return createEmptyEditorDocument();

  if (!trimmed.startsWith('{')) return trimmed;

  try {
    return JSON.parse(trimmed);
  } catch {
    return createEmptyEditorDocument();
  }
};

const hasNodeContent = (node) => {
  if (!node) return false;
  if (node.type === 'text') return Boolean(node.text?.trim());
  if (node.type === 'image') return Boolean(node.attrs?.src);
  if (node.type === 'video' || node.type === 'iframe' || node.type === 'embed') return Boolean(node.attrs?.src);
  if (Array.isArray(node.content)) return node.content.some(hasNodeContent);
  return false;
};

export const hasEditorContent = (content = '') => {
  const parsed = parseEditorContent(content);
  if (typeof parsed === 'string') return Boolean(parsed.trim());
  return hasNodeContent(parsed);
};
