import { render, screen } from '@testing-library/react';

const getPublishedPage = jest.fn();
const notFound = jest.fn(() => {
  throw new Error('NEXT_NOT_FOUND');
});

jest.mock('@/lib/services/pages', () => ({
  getPublishedPage: (...args) => getPublishedPage(...args),
}));
jest.mock('next/navigation', () => ({
  notFound: () => notFound(),
}));

import { buildCmsPageMetadata, CmsPageTemplate } from '../cms-page-template';
import CancellationPage, { generateMetadata as generateCancellationMetadata } from '../cancellation/page';
import PrivacyPage, { generateMetadata as generatePrivacyMetadata } from '../privacy/page';
import TermsPage, { generateMetadata as generateTermsMetadata } from '../terms/page';

const publishedLegalPage = (overrides = {}) => ({
  title: 'Privacy Policy',
  slug: 'privacy',
  status: 'published',
  excerpt: 'Last updated: April 4, 2026',
  content: 'Published legal body content',
  ...overrides,
});

describe('CmsPageTemplate', () => {
  beforeEach(() => {
    getPublishedPage.mockReset();
    notFound.mockClear();
  });

  it('uses scoped public wrapping for CMS rich text and long hero copy', async () => {
    getPublishedPage.mockResolvedValue({
      success: true,
      data: publishedLegalPage({
        title: 'CMS page',
        slug: 'cms-page',
        hero_heading: 'averyveryveryveryveryveryveryveryverylongheading',
        hero_text: 'https://example.com/averyveryveryveryveryveryverylongpath',
        content: 'CMS body content',
      }),
    });

    const { container } = render(await CmsPageTemplate({ slug: 'cms-page' }));

    expect(container.querySelector('[data-cms-hero-heading]')).toHaveClass('break-words');
    expect(container.querySelector('[data-cms-hero-text]')).toHaveClass('break-words');
    expect(container.querySelector('.rich-text-editor-content')).toHaveClass('public-rich-text');
  });

  it('renders published legal CMS content without changing wording', async () => {
    getPublishedPage.mockResolvedValue({
      success: true,
      data: publishedLegalPage({
        title: 'Terms of Service',
        slug: 'terms',
        content: 'Published terms wording stays intact.',
      }),
    });

    render(await CmsPageTemplate({ slug: 'terms' }));

    expect(screen.getByRole('heading', { name: 'Terms of Service' })).toBeInTheDocument();
    expect(screen.getByText('Published terms wording stays intact.')).toBeInTheDocument();
    expect(notFound).not.toHaveBeenCalled();
  });

  it('sends unpublished legal CMS content to notFound', async () => {
    getPublishedPage.mockResolvedValue({
      success: true,
      data: publishedLegalPage({
        slug: 'privacy',
        status: 'draft',
      }),
    });

    await expect(CmsPageTemplate({ slug: 'privacy' })).rejects.toThrow('NEXT_NOT_FOUND');

    expect(notFound).toHaveBeenCalledTimes(1);
  });

  it('sends missing legal CMS content to notFound', async () => {
    getPublishedPage.mockResolvedValue({
      success: false,
      message: 'Page not found',
    });

    await expect(CmsPageTemplate({ slug: 'cancellation' })).rejects.toThrow('NEXT_NOT_FOUND');

    expect(notFound).toHaveBeenCalledTimes(1);
  });

  it('throws API failures so the route error boundary can show the error state', async () => {
    getPublishedPage.mockResolvedValue({
      success: false,
      message: 'Request failed with status code 500',
    });

    await expect(CmsPageTemplate({ slug: 'terms' })).rejects.toThrow('Request failed with status code 500');

    expect(notFound).not.toHaveBeenCalled();
  });

  it('uses not-found metadata for unpublished legal CMS content', async () => {
    getPublishedPage.mockResolvedValue({
      success: true,
      data: publishedLegalPage({ status: 'draft' }),
    });

    await expect(buildCmsPageMetadata('privacy', '/privacy')).resolves.toEqual({
      title: 'Page Not Found',
      description: 'Learn more about Weelp.',
    });
  });

  it('wires Step 7 legal route slugs and canonical metadata paths to CMS', async () => {
    getPublishedPage.mockResolvedValue({
      success: true,
      data: publishedLegalPage({
        seo: {
          meta_title: 'Legal SEO title',
          meta_description: 'Legal SEO description',
        },
      }),
    });

    expect(PrivacyPage()).toMatchObject({ props: { slug: 'privacy' } });
    expect(TermsPage()).toMatchObject({ props: { slug: 'terms' } });
    expect(CancellationPage()).toMatchObject({ props: { slug: 'cancellation' } });

    await expect(generatePrivacyMetadata()).resolves.toMatchObject({ alternates: { canonical: '/privacy' } });
    await expect(generateTermsMetadata()).resolves.toMatchObject({ alternates: { canonical: '/terms' } });
    await expect(generateCancellationMetadata()).resolves.toMatchObject({ alternates: { canonical: '/cancellation' } });

    expect(getPublishedPage).toHaveBeenNthCalledWith(1, 'privacy');
    expect(getPublishedPage).toHaveBeenNthCalledWith(2, 'terms');
    expect(getPublishedPage).toHaveBeenNthCalledWith(3, 'cancellation');
  });
});
