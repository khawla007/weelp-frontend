import { render, screen } from '@testing-library/react';
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
});
