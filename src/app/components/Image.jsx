'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FALLBACK_IMAGE } from '../../constants/image';

export default function SafeImage({ src = '', alt = '', ...props }) {
  const [imgSrc, setImgSrc] = useState(src || FALLBACK_IMAGE);
  const [hasError, setHasError] = useState(false);

  // Check if src is an external URL (localhost:9000 or other external domains)
  const isExternal = src && (src.includes('localhost:9000') || src.includes('127.0.0.1:9000') || src.startsWith('http://') || src.startsWith('https://'));

  // Update imgSrc when src prop changes
  useEffect(() => {
    if (src) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setImgSrc(src);
      setHasError(false);
    }
  }, [src]);

  // If external URL causing issues, use unoptimized
  if (isExternal) {
    return (
      <img
        {...props}
        src={hasError ? FALLBACK_IMAGE : imgSrc || FALLBACK_IMAGE}
        alt={alt}
        onError={() => {
          setHasError(true);
          setImgSrc(FALLBACK_IMAGE);
        }}
        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
      />
    );
  }

  // Use Next.js Image for local images
  return <Image {...props} src={imgSrc || FALLBACK_IMAGE} alt={alt} onError={() => setImgSrc(FALLBACK_IMAGE)} sizes="100vw" fill style={{ objectFit: 'cover' }} />;
}
