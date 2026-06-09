'use client';

import { useEffect } from 'react';
import { getSeoScripts } from '@/lib/seo/seoMetadata';

export default function SeoHeadScripts({ seo, idPrefix = 'seo-head' }) {
  const { schemaData, headCode } = getSeoScripts(seo);
  const schemaJson = schemaData ? JSON.stringify(schemaData) : '';

  useEffect(() => {
    const snippet = String(headCode || '').trim();

    if (!snippet && !schemaJson) return undefined;

    document.head.querySelectorAll(`[data-weelp-seo-head="${idPrefix}"]`).forEach((node) => node.remove());

    const parser = new DOMParser();
    const parsed = parser.parseFromString(`<head>${snippet}</head>`, 'text/html');
    const insertedNodes = [];

    if (schemaJson) {
      const schemaScript = document.createElement('script');
      schemaScript.type = 'application/ld+json';
      schemaScript.textContent = schemaJson;
      schemaScript.setAttribute('data-weelp-seo-head', idPrefix);
      document.head.appendChild(schemaScript);
      insertedNodes.push(schemaScript);
    }

    Array.from(parsed.head.childNodes).forEach((node) => {
      let nextNode;

      if (node.nodeName.toLowerCase() === 'script') {
        nextNode = document.createElement('script');
        Array.from(node.attributes || []).forEach((attribute) => {
          nextNode.setAttribute(attribute.name, attribute.value);
        });
        nextNode.textContent = node.textContent;
      } else {
        nextNode = document.importNode(node, true);
      }

      if (nextNode.nodeType === Node.ELEMENT_NODE) {
        nextNode.setAttribute('data-weelp-seo-head', idPrefix);
      }

      document.head.appendChild(nextNode);
      insertedNodes.push(nextNode);
    });

    return () => {
      insertedNodes.forEach((node) => node.remove());
    };
  }, [headCode, idPrefix, schemaJson]);

  return null;
}
