import { render, screen, fireEvent } from '@testing-library/react';

import { buildPartialHeadingBlocks, buildPartialTextAlignBlocks, createEmptyEditorDocument, parseEditorContent, RichTextEditor } from '../RichTextEditor';
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
  it('switches heading content back to paragraph text', () => {
    const onChange = jest.fn();
    const headingContent = JSON.stringify({
      type: 'doc',
      content: [{ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Heading text' }] }],
    });

    render(<RichTextEditor content={headingContent} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: /paragraph/i }));

    const latestContent = JSON.parse(onChange.mock.calls.at(-1)[0]);
    expect(latestContent.content[0].type).toBe('paragraph');
  });

  it('keeps editor selection when toolbar buttons are clicked', () => {
    const onChange = jest.fn();

    render(<RichTextEditor content="" onChange={onChange} />);

    const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    screen.getByRole('button', { name: /heading 2/i }).dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it('applies center alignment to the current text block', () => {
    const onChange = jest.fn();

    render(<RichTextEditor content="" onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: /align center/i }));

    const latestContent = JSON.parse(onChange.mock.calls.at(-1)[0]);
    expect(latestContent.content[0].attrs.textAlign).toBe('center');
  });

  it('builds separate blocks when partial text becomes a heading', () => {
    expect(
      buildPartialHeadingBlocks({
        beforeText: 'alpha ',
        selectedText: 'beta',
        afterText: ' gamma',
        level: 1,
      }),
    ).toEqual([
      { type: 'paragraph', content: [{ type: 'text', text: 'alpha ' }] },
      { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'beta' }] },
      { type: 'paragraph', content: [{ type: 'text', text: ' gamma' }] },
    ]);
  });

  it('builds separate blocks when partial text is centered', () => {
    expect(
      buildPartialTextAlignBlocks({
        beforeText: 'alpha ',
        selectedText: 'beta',
        afterText: ' gamma',
        textAlign: 'center',
      }),
    ).toEqual([
      { type: 'paragraph', content: [{ type: 'text', text: 'alpha ' }] },
      { type: 'paragraph', attrs: { textAlign: 'center' }, content: [{ type: 'text', text: 'beta' }] },
      { type: 'paragraph', content: [{ type: 'text', text: ' gamma' }] },
    ]);
  });

  it('inserts a horizontal rule node', () => {
    const onChange = jest.fn();

    render(<RichTextEditor content="" onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: /horizontal rule/i }));

    const latestContent = JSON.parse(onChange.mock.calls.at(-1)[0]);
    expect(JSON.stringify(latestContent)).toContain('horizontalRule');
  });

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
