import Script from 'next/script';
import { getSeoScripts, splitSeoSnippet } from '@/lib/seo/seoMetadata';

export default function SeoBodyScripts({ seo, idPrefix = 'seo-body' }) {
  const { bodyCode } = getSeoScripts(seo);
  const { html, scripts } = splitSeoSnippet(bodyCode);

  return (
    <>
      {html && <div dangerouslySetInnerHTML={{ __html: html }} />}
      {scripts.map((script, index) => (
        <Script key={`${idPrefix}-${index}`} id={`${idPrefix}-custom-${index}`} strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: script }} />
      ))}
    </>
  );
}
