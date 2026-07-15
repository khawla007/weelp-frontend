'use client';

import { useState } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NavigationLink from '@/app/components/Navigation/NavigationLink';
import { RichTextRenderer } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/shared/RichTextRenderer';

const previewStorageKey = 'weelp:blog-preview';

const readPreview = () => {
  try {
    return JSON.parse(window.localStorage.getItem(previewStorageKey) || '{}');
  } catch {
    return {};
  }
};

export default function BlogPreviewPage() {
  const [preview] = useState(() => (typeof window === 'undefined' ? null : readPreview()));

  if (!preview) {
    return (
      <main className="min-h-screen bg-background px-6 py-20">
        <div className="mx-auto max-w-3xl text-copy">Loading preview...</div>
      </main>
    );
  }

  if (!preview?.content && !preview?.name) {
    return (
      <main className="min-h-screen bg-background px-6 py-20">
        <div className="mx-auto max-w-3xl space-y-4">
          <h1 className="text-2xl font-semibold text-foreground">Preview unavailable</h1>
          <p className="text-copy">Return to the Blog editor and click Preview again.</p>
          <Button asChild>
            <NavigationLink href="/dashboard/admin/blogs">Back to blogs</NavigationLink>
          </Button>
        </div>
      </main>
    );
  }

  const gallery = Array.isArray(preview.media_gallery) ? preview.media_gallery : [];
  const heroImage = gallery.find((media) => media?.is_featured)?.url || gallery[0]?.url;
  const tags = Array.isArray(preview.tags) ? preview.tags : [];
  const categories = Array.isArray(preview.categories) ? preview.categories : [];

  return (
    <>
      <div className="sticky left-0 right-0 top-0 z-[100000] bg-weelp-sage-deep px-4 py-3 text-white">
        <div className="mx-auto flex max-w-pen flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
            <button
              type="button"
              onClick={() => window.close()}
              className="inline-flex min-h-10 items-center gap-2 rounded-sm text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <ArrowLeft className="size-4" />
              Close Preview
            </button>
            <span className="min-h-10 min-w-0 content-center text-sm font-medium">Blog Preview</span>
            {preview.publish ? <span className="min-h-10 content-center text-sm">Published draft</span> : <span className="min-h-10 content-center text-sm">Draft</span>}
          </div>
          {preview.original_url && (
            <a
              href={preview.original_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 w-fit items-center gap-1 rounded-sm text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              View Original
              <ExternalLink className="size-3" />
            </a>
          )}
        </div>
      </div>

      <main className="min-h-screen bg-background">
        <section className="flex min-h-[360px] flex-col gap-8 bg-gradient-to-r from-muted to-weelp-sage-wash p-6 md:flex-row md:px-24">
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-5">
            <h1 className="break-words text-3xl font-semibold leading-tight text-foreground md:text-5xl">{preview.name || 'Untitled blog'}</h1>
            {preview.excerpt && <p className="max-w-3xl text-base font-medium text-weelp-steel md:text-lg">{preview.excerpt}</p>}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {tags.map((tag) => (
                  <span key={tag.id || tag.name} className="max-w-full break-words rounded-full bg-surface-tint px-4 py-2 text-sm text-weelp-copy">
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
          {heroImage && <img src={heroImage} alt={preview.name || 'Blog preview'} className="h-56 w-full rounded-lg object-cover sm:h-72 md:h-[320px] md:max-w-md" />}
        </section>

        <section className="flex flex-col lg:flex-row">
          <article className="flex-[2] bg-muted">
            <div className="mx-auto max-w-4xl p-6">
              <RichTextRenderer content={preview.content || ''} className="public-rich-text" />
            </div>
          </article>
          <aside className="flex flex-1 flex-col gap-6 p-6 px-8">
            <h2 className="text-lg font-semibold capitalize text-foreground sm:text-[28px]">Categories</h2>
            {categories.length > 0 ? (
              <ul className="flex max-w-full flex-wrap gap-2 sm:gap-4">
                {categories.map((category) => (
                  <li key={category.id || category.name} className="w-fit max-w-full break-words rounded-md border px-4 py-3 text-base font-medium capitalize text-Lynchcolor sm:px-6 sm:py-4">
                    {category.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No categories selected.</p>
            )}
          </aside>
        </section>
      </main>
    </>
  );
}
