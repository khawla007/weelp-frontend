import { render, screen } from '@testing-library/react';

const getSingleBlogMock = jest.fn();

jest.mock('@/lib/services/blogs', () => ({
  getSingleBlog: (...args) => getSingleBlogMock(...args),
}));

jest.mock('@/app/components/Pages/FRONT_END/singleblog/BannerSection', () => ({
  __esModule: true,
  default: () => <section data-testid="blog-banner" />,
}));

jest.mock('@/app/components/Pages/FRONT_END/singleblog/ContentSection', () => ({
  __esModule: true,
  default: () => <section data-testid="blog-content" />,
}));

jest.mock('@/app/components/Pages/FRONT_END/Global/GuideSection', () => ({
  __esModule: true,
  default: ({ className = '' }) => <section data-testid="recommended-section" className={className} />,
}));

jest.mock('@/app/components/SEO/SeoHeadScripts', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/app/components/SEO/SeoBodyScripts', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/app/components/SEO/SeoFooterScripts', () => ({
  __esModule: true,
  default: () => null,
}));

import SingleBlogPage, { generateMetadata } from '../page';

describe('SingleBlogPage', () => {
  it('uses the publication timestamp in article metadata', async () => {
    getSingleBlogMock.mockResolvedValue({
      success: true,
      data: {
        name: 'A travel story',
        excerpt: 'Story summary',
        published_at: '2026-08-13T12:15:00.000000Z',
        updated_at: '2026-08-13T13:00:00.000000Z',
        media_gallery: [],
        seo: {},
      },
    });

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'a-travel-story' }) });

    expect(metadata.openGraph).toEqual(
      expect.objectContaining({
        type: 'article',
        publishedTime: '2026-08-13T12:15:00.000000Z',
        modifiedTime: '2026-08-13T13:00:00.000000Z',
      }),
    );
  });

  it('leaves the footer as the only spacing owner after the recommended section', async () => {
    getSingleBlogMock.mockResolvedValue({
      success: true,
      data: {
        name: 'A travel story',
        content: '<p>Story content</p>',
        categories: [],
        tags: [],
        media_gallery: [],
        seo: {},
      },
    });

    render(await SingleBlogPage({ params: Promise.resolve({ slug: 'a-travel-story' }) }));

    expect(screen.getByTestId('recommended-section')).toHaveClass('pb-0');
    expect(screen.getByTestId('recommended-section')).not.toHaveClass('pb-10');
    expect(screen.getByTestId('recommended-section')).not.toHaveClass('md:pb-16');
    expect(screen.getByTestId('recommended-section')).not.toHaveClass('lg:pb-24');
  });
});
