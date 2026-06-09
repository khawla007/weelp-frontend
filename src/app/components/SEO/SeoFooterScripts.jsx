import Script from 'next/script';
import { getSeoScripts, splitSeoSnippet } from '@/lib/seo/seoMetadata';

export default function SeoFooterScripts({ seo, idPrefix = 'seo-footer' }) {
  const { footerCode } = getSeoScripts(seo);
  const { html, scripts } = splitSeoSnippet(footerCode);

  if (!html && !scripts.length) return null;

  return (
    <>
      {html && <div dangerouslySetInnerHTML={{ __html: html }} />}
      {scripts.map((script, index) => (
        <Script key={`${idPrefix}-${index}`} id={`${idPrefix}-custom-${index}`} strategy="lazyOnload" dangerouslySetInnerHTML={{ __html: script }} />
      ))}
    </>
  );
}
