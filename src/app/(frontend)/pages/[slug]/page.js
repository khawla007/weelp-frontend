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

export async function generateMetadata({ params }) {
  const { slug } = await params;
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
    fallbackCanonical: `/pages/${slug}`,
  });
}

const CmsPublicPage = async ({ params }) => {
  const { slug } = await params;
  const { success, data } = await getPublishedPage(slug);

  if (!success || !data || !isPublishedPage(data)) {
    notFound();
  }

  const title = data.title || data.name || 'Page';

  return (
    <>
      <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-8 space-y-3">
          <h1 className="text-3xl font-semibold tracking-normal text-zinc-950 sm:text-4xl">{title}</h1>
          {data.excerpt && <p className="text-base leading-7 text-zinc-600">{data.excerpt}</p>}
        </header>

        <article className="prose prose-zinc max-w-none">
          <RichTextRenderer content={data.content || ''} />
        </article>
      </main>
    </>
  );
};

export default CmsPublicPage;
