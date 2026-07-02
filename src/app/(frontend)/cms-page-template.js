import { notFound } from 'next/navigation';
import { buildSeoMetadata } from '@/lib/seo/seoMetadata';
import { getPublishedPage } from '@/lib/services/pages';
import { isPublishedPage } from '@/lib/pages/normalizers';
import { RichTextRenderer } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/shared/RichTextRenderer';

const META_DESCRIPTION_LIMIT = 155;
const FALLBACK_DESCRIPTION = 'Learn more about Weelp.';

const stripHtml = (input) =>
  String(input ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const truncate = (text, max = META_DESCRIPTION_LIMIT) => {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trim()}...`;
};

const isSafePublicUrl = (url) => {
  const value = String(url || '').trim();
  if (!value) return false;
  if (value.startsWith('/') || value.startsWith('#')) return true;

  try {
    const parsed = new URL(value);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

const cssUrl = (url) => `url("${String(url).replace(/["\\]/g, '\\$&')}")`;

export async function buildCmsPageMetadata(slug, canonicalPath = `/pages/${slug}`) {
  const { success, data } = await getPublishedPage(slug);

  if (!success || !data || !isPublishedPage(data)) {
    return {
      title: 'Page Not Found',
      description: FALLBACK_DESCRIPTION,
    };
  }

  const title = data.title || data.name || 'Weelp Page';
  const fallbackDescription = truncate(stripHtml(data.excerpt) || stripHtml(data.content)) || FALLBACK_DESCRIPTION;

  return buildSeoMetadata({
    seo: data.seo,
    fallbackTitle: title,
    fallbackDescription,
    fallbackCanonical: canonicalPath,
  });
}

export async function CmsPageTemplate({ slug }) {
  const { success, data } = await getPublishedPage(slug);

  if (!success || !data || !isPublishedPage(data)) {
    notFound();
  }

  const title = data.title || data.name || 'Page';
  const heroBackgroundUrl = isSafePublicUrl(data.hero_background_image_url) ? data.hero_background_image_url : '';
  const heroButtonUrl = isSafePublicUrl(data.hero_button_url) ? data.hero_button_url : '';
  const hasHero = Boolean(heroBackgroundUrl || data.hero_heading || data.hero_text || data.hero_button_label || heroButtonUrl);
  const heroHeading = data.hero_heading || title;
  const heroText = data.hero_text || data.excerpt;

  return (
    <>
      {hasHero && (
        <section
          className="relative isolate overflow-hidden bg-weelp-sage-deep px-4 py-20 text-white sm:px-6 lg:px-8"
          style={
            heroBackgroundUrl
              ? {
                  backgroundImage: `linear-gradient(rgba(20, 35, 30, 0.62), rgba(20, 35, 30, 0.62)), ${cssUrl(heroBackgroundUrl)}`,
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
                }
              : undefined
          }
        >
          <div className="mx-auto max-w-4xl space-y-5">
            <h1 className="text-4xl font-semibold tracking-normal sm:text-5xl">{heroHeading}</h1>
            {heroText && <p className="max-w-2xl text-base leading-7 text-white/90 sm:text-lg">{heroText}</p>}
            {data.hero_button_label && heroButtonUrl && (
              <a
                href={heroButtonUrl}
                className="inline-flex min-h-10 items-center justify-center rounded-md bg-background px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background/90"
              >
                {data.hero_button_label}
              </a>
            )}
          </div>
        </section>
      )}

      <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {!hasHero && (
          <header className="mb-8 space-y-3">
            <h1 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">{title}</h1>
            {data.excerpt && <p className="text-base leading-7 text-copy">{data.excerpt}</p>}
          </header>
        )}
        <article className="prose prose-zinc max-w-none dark:prose-invert">
          <RichTextRenderer content={data.content || ''} />
        </article>
      </main>
    </>
  );
}
