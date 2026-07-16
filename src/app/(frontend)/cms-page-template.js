import { notFound } from 'next/navigation';
import { buildSeoMetadata } from '@/lib/seo/seoMetadata';
import { getPublishedPage } from '@/lib/services/pages';
import { isPublishedPage } from '@/lib/pages/normalizers';
import { RichTextRenderer } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/shared/RichTextRenderer';
import NavigationLink from '@/app/components/Navigation/NavigationLink';

const META_DESCRIPTION_LIMIT = 155;
const FALLBACK_DESCRIPTION = 'Learn more about Weelp.';
const CMS_NOT_FOUND_MESSAGES = new Set(['Page not found', 'Slug not found']);

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
const HORIZONTAL_ALIGN = {
  left: 'left',
  center: 'center',
  right: 'right',
};
const HORIZONTAL_JUSTIFY = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
};
const VERTICAL_ALIGN = {
  top: 'flex-start',
  middle: 'center',
  bottom: 'flex-end',
};

const safeAlign = (value, fallback = 'left') => HORIZONTAL_ALIGN[value] || fallback;
const safeJustify = (value, fallback = 'flex-start') => HORIZONTAL_JUSTIFY[value] || fallback;
const safeVerticalAlign = (value) => VERTICAL_ALIGN[value] || 'center';
const safeBlockMargin = (value) => {
  if (value === 'center') return '0 auto';
  if (value === 'right') return '0 0 0 auto';
  return undefined;
};
const safeCssValue = (value) => {
  const normalized = String(value || '').trim();
  return /^[\d\s.]+(px|rem|em|%)?(\s+[\d\s.]+(px|rem|em|%)?){0,3}$/.test(normalized) ? normalized : undefined;
};
const safeColor = (value) => {
  const normalized = String(value || '').trim();
  return /^#([\da-f]{3}|[\da-f]{6})$/i.test(normalized) ? normalized : undefined;
};
const hexToRgba = (hex, opacity) => {
  const color = safeColor(hex);
  const alpha = Number.isFinite(Number(opacity)) ? Math.min(Math.max(Number(opacity), 0), 1) : 0.62;
  if (!color) return `rgba(20, 35, 30, ${alpha})`;
  const raw = color.length === 4 ? color.replace(/^#(.)(.)(.)$/, '#$1$1$2$2$3$3') : color;
  const int = Number.parseInt(raw.slice(1), 16);
  const red = (int >> 16) & 255;
  const green = (int >> 8) & 255;
  const blue = int & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};
const textDecoration = (enabled) => (enabled ? 'underline' : undefined);
const fontWeight = (enabled, fallback) => (enabled ? 700 : fallback);
const fontStyle = (enabled) => (enabled ? 'italic' : undefined);
const isCmsNotFoundResponse = ({ success, message }) => !success && CMS_NOT_FOUND_MESSAGES.has(message);
const assertNoCmsApiError = (response) => {
  if (!response?.success && !isCmsNotFoundResponse(response)) {
    throw new Error(response?.message || 'Failed to fetch CMS page');
  }
};

export async function buildCmsPageMetadata(slug, canonicalPath = `/pages/${slug}`) {
  const response = await getPublishedPage(slug);
  assertNoCmsApiError(response);

  const { success, data } = response;

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
  const response = await getPublishedPage(slug);
  assertNoCmsApiError(response);

  const { success, data } = response;

  if (!success || !data || !isPublishedPage(data)) {
    notFound();
  }

  const title = data.title || data.name || 'Page';
  const heroBackgroundUrl = isSafePublicUrl(data.hero_background_image_url) ? data.hero_background_image_url : '';
  const heroButtonUrl = isSafePublicUrl(data.hero_button_url) ? data.hero_button_url : '';
  const hasHero = Boolean(heroBackgroundUrl || data.hero_heading || data.hero_text || data.hero_button_label || heroButtonUrl);
  const heroHeading = data.hero_heading || title;
  const heroText = data.hero_text || data.excerpt;
  const overlay = hexToRgba(data.hero_overlay_color, data.hero_overlay_opacity);
  const heroSectionStyle = heroBackgroundUrl
    ? {
        backgroundImage: `linear-gradient(${overlay}, ${overlay}), ${cssUrl(heroBackgroundUrl)}`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }
    : undefined;
  const heroLayoutStyle = { alignItems: safeVerticalAlign(data.hero_content_vertical_position) };
  const headingStyle = {
    color: safeColor(data.hero_heading_color),
    fontSize: safeCssValue(data.hero_heading_size),
    textAlign: safeAlign(data.hero_heading_align),
    fontWeight: fontWeight(data.hero_heading_bold, 600),
    fontStyle: fontStyle(data.hero_heading_italic),
    textDecoration: textDecoration(data.hero_heading_underline),
  };
  const textStyle = {
    color: safeColor(data.hero_text_color),
    fontSize: safeCssValue(data.hero_text_size),
    textAlign: safeAlign(data.hero_text_align),
    margin: safeBlockMargin(data.hero_text_align),
    fontWeight: fontWeight(data.hero_text_bold, 400),
    fontStyle: fontStyle(data.hero_text_italic),
    textDecoration: textDecoration(data.hero_text_underline),
  };
  const buttonStyle = {
    borderRadius: safeCssValue(data.hero_button_radius),
    borderWidth: safeCssValue(data.hero_button_border_width),
    padding: safeCssValue(data.hero_button_padding),
    margin: safeCssValue(data.hero_button_margin),
    color: safeColor(data.hero_button_text_color),
    backgroundColor: safeColor(data.hero_button_bg_color),
    borderColor: safeColor(data.hero_button_border_color),
    fontSize: safeCssValue(data.hero_button_text_size),
  };
  const buttonWrapStyle = { justifyContent: safeJustify(data.hero_button_align) };

  return (
    <>
      {hasHero && (
        <section className="relative isolate flex min-h-[420px] overflow-hidden bg-weelp-sage-deep px-4 py-20 text-white sm:px-6 lg:px-8" style={heroSectionStyle}>
          <div className="mx-auto flex w-full max-w-4xl" style={heroLayoutStyle}>
            <div className="w-full space-y-5">
              <h1 data-cms-hero-heading className="min-w-0 break-words text-4xl tracking-normal sm:text-5xl" style={headingStyle}>
                {heroHeading}
              </h1>
              {heroText && (
                <p data-cms-hero-text className="min-w-0 max-w-2xl break-words text-base leading-7 text-white/90 sm:text-lg" style={textStyle}>
                  {heroText}
                </p>
              )}
              {data.hero_button_label && heroButtonUrl && (
                <div className="flex" style={buttonWrapStyle}>
                  {heroButtonUrl.startsWith('/') || heroButtonUrl.startsWith('#') ? (
                    <NavigationLink
                      href={heroButtonUrl}
                      className="inline-flex min-h-11 items-center justify-center rounded-md border border-transparent bg-background px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background/90"
                      style={buttonStyle}
                    >
                      {data.hero_button_label}
                    </NavigationLink>
                  ) : (
                    <a
                      href={heroButtonUrl}
                      className="inline-flex min-h-11 items-center justify-center rounded-md border border-transparent bg-background px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background/90"
                      style={buttonStyle}
                    >
                      {data.hero_button_label}
                    </a>
                  )}
                </div>
              )}
            </div>
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
          <RichTextRenderer content={data.content || ''} className="public-rich-text" />
        </article>
      </main>
    </>
  );
}
