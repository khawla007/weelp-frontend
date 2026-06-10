import { render, screen, fireEvent } from '@testing-library/react';

import { createEmptyEditorDocument, parseEditorContent, RichTextEditor } from '../RichTextEditor';
import { hasEditorContent } from '../richTextContent';

describe('parseEditorContent', () => {
  it('returns valid Tiptap JSON unchanged from a string payload', () => {
    const payload = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }],
    };

    expect(parseEditorContent(JSON.stringify(payload))).toEqual(payload);
  });

  it('falls back to an empty document for malformed JSON', () => {
    expect(parseEditorContent('{broken json')).toEqual(createEmptyEditorDocument());
  });
});

describe('hasEditorContent', () => {
  it('treats legacy plain text blog content as valid content', () => {
    expect(hasEditorContent('Existing blog body')).toBe(true);
  });
});

describe('RichTextEditor', () => {
  it('inserts selected media as an image node', () => {
    const onChange = jest.fn();

    render(
      <RichTextEditor
        content=""
        onChange={onChange}
        mediaPicker={({ onSelect }) => (
          <button type="button" onClick={() => onSelect({ url: '/storage/media/editor.jpg', alt_text: 'Editor image', name: 'Editor image' })}>
            Pick media
          </button>
        )}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /insert image/i }));
    fireEvent.click(screen.getByRole('button', { name: /pick media/i }));

    const latestContent = JSON.parse(onChange.mock.calls.at(-1)[0]);
    expect(JSON.stringify(latestContent)).toContain('/storage/media/editor.jpg');
    expect(JSON.stringify(latestContent)).toContain('Editor image');
  });
});
