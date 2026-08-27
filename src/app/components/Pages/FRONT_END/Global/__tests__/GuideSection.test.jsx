import { render } from '@testing-library/react';

import GuideSection from '../GuideSection';
import { mapBlogToItemCard } from '@/lib/mapProductToItemCard';

const mockBlogSection = jest.fn(() => <section data-testid="blog-section" />);

jest.mock('@/app/components/ui/BlogSection', () => ({
  __esModule: true,
  default: (props) => mockBlogSection(props),
}));

jest.mock('@/app/components/sliders/PostSlider', () => ({
  __esModule: true,
  default: () => <div data-testid="legacy-post-slider" />,
}));

test('delegates legacy slugless recommendations to BlogSection safely', () => {
  const data = [{ id: 1, name: 'Legacy guide', category: 'Travel', image: '/legacy.jpg' }];
  render(<GuideSection sectionTitle="Recommended" className="pb-0" data={data} />);

  expect(mockBlogSection.mock.calls.at(-1)[0]).toEqual(
    expect.objectContaining({
      title: 'Recommended',
      className: 'pb-0',
      blogs: data,
    }),
  );
  expect(mapBlogToItemCard(mockBlogSection.mock.calls[0][0].blogs[0])).toMatchObject({
    href: null,
    title: 'Legacy guide',
    category: 'Travel',
    image: '/legacy.jpg',
  });
});
