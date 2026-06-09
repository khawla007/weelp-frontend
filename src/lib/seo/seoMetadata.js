const clean = (value) => {
  if (typeof value !== 'string') return value ?? undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
};

export const parseSchemaData = (value) => {
  if (!value) return null;
  if (typeof value === 'object') return value;
  if (typeof value !== 'string') return null;

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

export const buildSeoMetadata = ({ seo = {}, fallbackTitle = '', fallbackDescription = '', fallbackCanonical, fallbackOgImage } = {}) => {
  const title = clean(seo?.meta_title) || fallbackTitle;
  const description = clean(seo?.meta_description) || fallbackDescription;
  const canonical = clean(seo?.canonical_url) || fallbackCanonical;
  const ogImage = clean(seo?.og_image_url) || fallbackOgImage;
  const keywords = clean(seo?.keywords);

  return {
    title,
    description,
    ...(keywords && { keywords }),
    ...(canonical && { alternates: { canonical } }),
    openGraph: {
      title,
      description,
      ...(canonical && { url: canonical }),
      ...(ogImage && { images: [{ url: ogImage, alt: title }] }),
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
  };
};

export const getSeoScripts = (seo = {}) => ({
  schemaData: parseSchemaData(seo?.schema_data),
  headCode: clean(seo?.head_code),
  bodyCode: clean(seo?.body_code),
  footerCode: clean(seo?.footer_code),
});

export const splitSeoSnippet = (value) => {
  const snippet = clean(value);

  if (!snippet) {
    return {
      html: '',
      scripts: [],
    };
  }

  const scripts = [];
  const html = snippet
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, (_, scriptContent) => {
      const trimmedScript = String(scriptContent || '').trim();
      if (trimmedScript) scripts.push(trimmedScript);
      return '';
    })
    .trim();

  if (!scripts.length && !html.includes('<')) {
    scripts.push(snippet);
    return {
      html: '',
      scripts,
    };
  }

  return {
    html,
    scripts,
  };
};
