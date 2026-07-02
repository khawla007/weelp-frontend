import { fireEvent, render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';

import { BlogMain } from '../BlogMain';

jest.mock('../../shared/RichTextEditor', () => ({
  RichTextEditor: () => <div data-testid="rich-text-editor" />,
}));

jest.mock('../../media/MediaLibrary', () => ({
  Medialibrary: () => <div data-testid="media-library" />,
}));

const renderBlogMain = () => {
  const Wrapper = () => {
    const methods = useForm({
      defaultValues: {
        name: '',
        slug: '',
        content: '',
      },
    });

    return (
      <FormProvider {...methods}>
        <BlogMain />
      </FormProvider>
    );
  };

  return render(<Wrapper />);
};

describe('BlogMain', () => {
  it('does not render a duplicate visible label for the slug input', () => {
    renderBlogMain();

    expect(screen.getByText('Slug')).toBeInTheDocument();
    expect(screen.queryByText('URL slug')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Slug')).toBeInTheDocument();
  });

  it('updates the slug live as the title is typed', () => {
    renderBlogMain();

    const titleInput = screen.getByPlaceholderText('Enter Title');
    const slugInput = screen.getByLabelText('Slug');

    fireEvent.change(titleInput, { target: { value: 'B' } });
    expect(slugInput).toHaveValue('b');

    fireEvent.change(titleInput, { target: { value: 'Best Places' } });
    expect(slugInput).toHaveValue('best-places');
  });

  it('refreshes a manually entered slug when the title changes', () => {
    renderBlogMain();

    const titleInput = screen.getByPlaceholderText('Enter Title');
    const slugInput = screen.getByLabelText('Slug');

    fireEvent.change(slugInput, { target: { value: 'custom-blog-slug' } });
    fireEvent.change(titleInput, { target: { value: 'Best Places in Dubai' } });

    expect(slugInput).toHaveValue('best-places-in-dubai');
  });
});
