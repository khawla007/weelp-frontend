import { render } from '@testing-library/react';

import BlogSliderSection from '../BlogSliderSection';
import { useBlogs } from '@/hooks/api/public/blogs/useBlogs';

const mockBlogSection = jest.fn(() => <section data-testid="blog-section" />);

jest.mock('@/hooks/api/public/blogs/useBlogs', () => ({ useBlogs: jest.fn() }));
jest.mock('@/app/components/ui/BlogSection', () => ({
  __esModule: true,
  default: (props) => mockBlogSection(props),
}));

test('delegates Latest Blogs motion to the shared BlogSection', () => {
  const blogs = [{ id: 1, title: 'Paris guide' }];
  useBlogs.mockReturnValue({ blogs: { data: blogs }, error: null, isLoading: false });

  render(<BlogSliderSection />);

  const props = mockBlogSection.mock.calls.at(-1)[0];
  expect(props).toEqual(expect.objectContaining({ blogs, title: 'Latest Blogs', navigationId: 'latest-blogs' }));
  expect(props.className || '').not.toContain('weelp-fade-up');
});
