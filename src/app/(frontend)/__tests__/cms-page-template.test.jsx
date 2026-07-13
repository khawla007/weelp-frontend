import { render } from '@testing-library/react';

const getPublishedPage = jest.fn();

jest.mock('@/lib/services/pages', () => ({
  getPublishedPage: (...args) => getPublishedPage(...args),
}));
jest.mock('@/lib/pages/normalizers', () => ({
  isPublishedPage: () => true,
}));

import { CmsPageTemplate } from '../cms-page-template';

describe('CmsPageTemplate', () => {
  it('uses scoped public wrapping for CMS rich text and long hero copy', async () => {
    getPublishedPage.mockResolvedValue({
      success: true,
      data: {
        title: 'CMS page',
        status: 'published',
        hero_heading: 'averyveryveryveryveryveryveryveryverylongheading',
        hero_text: 'https://example.com/averyveryveryveryveryveryverylongpath',
        content: 'CMS body content',
      },
    });

    const { container } = render(await CmsPageTemplate({ slug: 'cms-page' }));

    expect(container.querySelector('[data-cms-hero-heading]')).toHaveClass('break-words');
    expect(container.querySelector('[data-cms-hero-text]')).toHaveClass('break-words');
    expect(container.querySelector('.rich-text-editor-content')).toHaveClass('public-rich-text');
  });
});
