import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { createPage, updatePage } from '@/lib/actions/pages';
import { PageForm } from '../PageForm';

const push = jest.fn();
const refresh = jest.fn();
const toast = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push, refresh }),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast }),
}));

jest.mock('@/lib/actions/pages', () => ({
  createPage: jest.fn(),
  updatePage: jest.fn(),
}));

jest.mock('../../PageFormHeader', () => ({
  PageFormHeader: () => <button type="submit">Save page</button>,
}));

jest.mock('../../PageMain', () => ({
  PageMain: () => <div data-testid="page-main" />,
}));

jest.mock('../../PageSidebar', () => ({
  PageSidebar: () => <div data-testid="page-sidebar" />,
}));

const pageData = {
  id: 7,
  title: 'About',
  slug: 'about',
  status: 'published',
  content: '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"About"}]}]}',
};

describe('PageForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('stays on the edit page and refreshes data after updating an existing page', async () => {
    const mutate = jest.fn();
    updatePage.mockResolvedValue({ success: true, message: 'Page updated successfully' });

    render(<PageForm editPage data={pageData} mutate={mutate} />);

    fireEvent.click(screen.getByRole('button', { name: /save page/i }));

    await waitFor(() => expect(updatePage).toHaveBeenCalledWith(7, expect.objectContaining({ title: 'About' })));

    expect(mutate).toHaveBeenCalled();
    expect(refresh).toHaveBeenCalled();
    expect(push).not.toHaveBeenCalledWith('/dashboard/admin/pages');
  });

  it('still redirects to the page index after creating a new page', async () => {
    createPage.mockResolvedValue({ success: true, message: 'Page created successfully' });

    render(<PageForm />);

    fireEvent.click(screen.getByRole('button', { name: /save page/i }));

    await waitFor(() => expect(createPage).toHaveBeenCalled());

    expect(push).toHaveBeenCalledWith('/dashboard/admin/pages');
  });
});
