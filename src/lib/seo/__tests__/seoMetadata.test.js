import { buildSeoMetadata, getSeoScripts, parseSchemaData, splitSeoSnippet } from '../seoMetadata';

describe('seoMetadata', () => {
  test('uses persisted SEO fields before fallbacks', () => {
    const metadata = buildSeoMetadata({
      seo: {
        meta_title: 'Persisted title',
        meta_description: 'Persisted description',
        keywords: 'dubai, tours',
        canonical_url: '/canonical',
        og_image_url: 'https://example.com/og.jpg',
      },
      fallbackTitle: 'Fallback title',
      fallbackDescription: 'Fallback description',
      fallbackCanonical: '/fallback',
      fallbackOgImage: 'https://example.com/fallback.jpg',
    });

    expect(metadata.title).toBe('Persisted title');
    expect(metadata.description).toBe('Persisted description');
    expect(metadata.keywords).toBe('dubai, tours');
    expect(metadata.alternates.canonical).toBe('/canonical');
    expect(metadata.openGraph.images).toEqual([{ url: 'https://example.com/og.jpg', alt: 'Persisted title' }]);
    expect(metadata.twitter.images).toEqual(['https://example.com/og.jpg']);
  });

  test('falls back when SEO fields are empty', () => {
    const metadata = buildSeoMetadata({
      seo: {},
      fallbackTitle: 'Fallback title',
      fallbackDescription: 'Fallback description',
      fallbackCanonical: '/fallback',
      fallbackOgImage: 'https://example.com/fallback.jpg',
    });

    expect(metadata.title).toBe('Fallback title');
    expect(metadata.description).toBe('Fallback description');
    expect(metadata.alternates.canonical).toBe('/fallback');
    expect(metadata.openGraph.images).toEqual([{ url: 'https://example.com/fallback.jpg', alt: 'Fallback title' }]);
  });

  test('parses schema data from object and JSON string', () => {
    expect(parseSchemaData({ '@type': 'Article' })).toEqual({ '@type': 'Article' });
    expect(parseSchemaData('{"@type":"Article"}')).toEqual({ '@type': 'Article' });
    expect(parseSchemaData('not json')).toBeNull();
  });

  test('separates schema, body, footer, and head scripts', () => {
    const scripts = getSeoScripts({
      schema_data: '{"@type":"Article"}',
      head_code: '<meta name="x-head" content="1">',
      body_code: '<script>window.bodySeo=true</script>',
      footer_code: '<script>window.footerSeo=true</script>',
    });

    expect(scripts.schemaData).toEqual({ '@type': 'Article' });
    expect(scripts.headCode).toBe('<meta name="x-head" content="1">');
    expect(scripts.bodyCode).toBe('<script>window.bodySeo=true</script>');
    expect(scripts.footerCode).toBe('<script>window.footerSeo=true</script>');
  });

  test('splits wrapped scripts from remaining trusted snippet html', () => {
    expect(splitSeoSnippet('<script>window.bodySeo=true</script>')).toEqual({
      html: '',
      scripts: ['window.bodySeo=true'],
    });
    expect(splitSeoSnippet('<noscript><iframe title="tag"></iframe></noscript><script>window.footerSeo=true</script>')).toEqual({
      html: '<noscript><iframe title="tag"></iframe></noscript>',
      scripts: ['window.footerSeo=true'],
    });
  });
});
