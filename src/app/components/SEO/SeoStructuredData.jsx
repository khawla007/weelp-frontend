import { getSeoScripts } from '@/lib/seo/seoMetadata';

export default function SeoStructuredData({ seo, id = 'seo-structured-data' }) {
  const { schemaData } = getSeoScripts(seo);

  if (!schemaData) return null;

  return <script id={id} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />;
}
